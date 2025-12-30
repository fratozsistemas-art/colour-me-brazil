import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    // Authenticate user
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, productId, successUrl, cancelUrl } = await req.json();

    if (!priceId || !productId) {
      return Response.json({ error: 'Missing priceId or productId' }, { status: 400 });
    }

    // Get price details to determine mode
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.type === 'recurring' ? 'subscription' : 'payment';

    // Create or retrieve Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          full_name: user.full_name || user.email
        }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get('origin')}/Shop?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/Shop?purchase=cancelled`,
      metadata: {
        user_id: user.id,
        product_id: productId,
        price_id: priceId
      }
    });

    // Create pending purchase record
    await base44.asServiceRole.entities.Purchase.create({
      user_id: user.id,
      stripe_customer_id: customer.id,
      product_id: productId,
      price_id: priceId,
      amount: price.unit_amount,
      currency: price.currency,
      status: 'pending',
      purchase_type: mode === 'subscription' ? 'subscription' : 'one_time',
      metadata: {
        session_id: session.id
      }
    });

    return Response.json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Checkout session error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, { status: 500 });
  }
});