import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemType, itemId, amount, currency = 'usd', itemName, successUrl, cancelUrl } = await req.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: itemName,
              description: `Purchase ${itemType}: ${itemName}`,
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.get('origin')}/Library?purchase=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/Library?purchase=cancelled`,
      metadata: {
        user_id: user.id,
        item_type: itemType,
        item_id: itemId,
      },
    });

    // Create pending purchase record
    await base44.asServiceRole.entities.Purchase.create({
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      amount: amount,
      currency: currency,
      stripe_payment_intent_id: session.payment_intent,
      status: 'pending'
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});