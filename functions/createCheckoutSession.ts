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

    const { itemType, itemId } = await req.json();

    if (!itemType || !itemId) {
      return Response.json({ error: 'itemType and itemId are required' }, { status: 400 });
    }

    const allowedOrigins = [
      'https://colourmebrazil.com',
      'https://www.colourmebrazil.com',
      'http://localhost:5173'
    ];
    const origin = req.headers.get('origin');
    if (!origin || !allowedOrigins.includes(origin)) {
      return Response.json({ error: 'Invalid origin' }, { status: 403 });
    }

    const books = await base44.asServiceRole.entities.Book.filter({ id: itemId });
    if (!books.length) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }

    const book = books[0];
    const isPrinted = itemType === 'printed_book';
    const amount = isPrinted ? 2499 : 499;
    const currency = isPrinted ? 'brl' : 'usd';
    const itemName = isPrinted ? `${book.title_en} (Printed Edition)` : book.title_en;

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
      success_url: `${origin}/Library?purchase=success&book_id=${itemId}`,
      cancel_url: `${origin}/Library?purchase=cancelled`,
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
      amount,
      currency,
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
