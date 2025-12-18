import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return Response.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const body = await req.text();
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    // Initialize Base44 client with service role
    const base44 = createClientFromRequest(req);

    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { user_id, item_type, item_id } = session.metadata;

      // Update purchase status
      const purchases = await base44.asServiceRole.entities.Purchase.filter({
        user_id: user_id,
        item_id: item_id,
        status: 'pending'
      });

      if (purchases.length > 0) {
        await base44.asServiceRole.entities.Purchase.update(purchases[0].id, {
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent
        });

        // Unlock book if it's a book purchase
        if (item_type === 'book') {
          await base44.asServiceRole.entities.Book.update(item_id, {
            is_locked: false
          });
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      
      // Update purchase status to failed
      const purchases = await base44.asServiceRole.entities.Purchase.filter({
        stripe_payment_intent_id: paymentIntent.id
      });

      if (purchases.length > 0) {
        await base44.asServiceRole.entities.Purchase.update(purchases[0].id, {
          status: 'failed'
        });
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});