import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook event received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Get purchase by session ID
        const purchases = await base44.asServiceRole.entities.Purchase.filter({
          'metadata.session_id': session.id
        });

        if (purchases.length > 0) {
          const purchase = purchases[0];
          
          // Update purchase status
          await base44.asServiceRole.entities.Purchase.update(purchase.id, {
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent,
            stripe_subscription_id: session.subscription,
            metadata: {
              ...purchase.metadata,
              completed_at: new Date().toISOString(),
              session_data: {
                payment_status: session.payment_status,
                amount_total: session.amount_total
              }
            }
          });

          // If it's a book purchase, unlock it for the user
          if (purchase.metadata?.book_id) {
            const books = await base44.asServiceRole.entities.Book.filter({
              id: purchase.metadata.book_id
            });
            
            if (books.length > 0) {
              await base44.asServiceRole.entities.Book.update(books[0].id, {
                is_locked: false
              });
            }
          }

          console.log('Purchase completed:', purchase.id);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        
        // Find and update purchase
        const purchases = await base44.asServiceRole.entities.Purchase.filter({
          stripe_payment_intent_id: paymentIntent.id
        });

        if (purchases.length > 0) {
          await base44.asServiceRole.entities.Purchase.update(purchases[0].id, {
            status: 'failed',
            metadata: {
              ...purchases[0].metadata,
              failure_reason: paymentIntent.last_payment_error?.message
            }
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Find and update purchase
        const purchases = await base44.asServiceRole.entities.Purchase.filter({
          stripe_subscription_id: subscription.id
        });

        if (purchases.length > 0) {
          await base44.asServiceRole.entities.Purchase.update(purchases[0].id, {
            status: 'cancelled',
            metadata: {
              ...purchases[0].metadata,
              cancelled_at: new Date().toISOString()
            }
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        
        // Find and update purchase by payment intent
        const purchases = await base44.asServiceRole.entities.Purchase.filter({
          stripe_payment_intent_id: charge.payment_intent
        });

        if (purchases.length > 0) {
          await base44.asServiceRole.entities.Purchase.update(purchases[0].id, {
            status: 'refunded',
            metadata: {
              ...purchases[0].metadata,
              refunded_at: new Date().toISOString(),
              refund_amount: charge.amount_refunded
            }
          });
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ 
      error: error.message || 'Webhook processing failed' 
    }, { status: 400 });
  }
});