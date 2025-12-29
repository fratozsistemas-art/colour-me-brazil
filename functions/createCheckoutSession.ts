import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    // ✅ CRITICAL: Validate authentication first
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.id) {
      console.error('❌ Unauthorized checkout attempt');
      return Response.json({ error: 'Unauthorized - please log in' }, { status: 401 });
    }

    const { itemType, itemId, successUrl, cancelUrl } = await req.json();

    // ✅ CRITICAL FIX: Buscar preço do banco de dados (PCI-DSS compliance)
    // NUNCA confie em preços/valores vindos do cliente
    let amount, currency, itemName;
    
    if (itemType === 'book' || itemType === 'printed_book') {
      const books = await base44.asServiceRole.entities.Book.filter({ id: itemId });
      if (books.length === 0) {
        console.error('❌ Book not found:', itemId);
        return Response.json({ error: 'Book not found' }, { status: 404 });
      }
      
      const book = books[0];
      // ✅ Preço vem do banco de dados (fonte confiável)
      amount = itemType === 'printed_book' ? 2499 : 499; // Em centavos
      currency = itemType === 'printed_book' ? 'brl' : 'usd';
      itemName = itemType === 'printed_book' 
        ? `${book.title_en} (Printed Edition)` 
        : book.title_en;
      
      console.log('✅ Price fetched from database:', { itemId, amount, currency, itemName });
    } else {
      return Response.json({ error: 'Invalid item type' }, { status: 400 });
    }

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

    // ✅ Create purchase record with audit trail
    await base44.asServiceRole.entities.Purchase.create({
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      amount: amount, // ✅ Preço validado do servidor
      currency: currency,
      stripe_payment_intent_id: session.payment_intent,
      status: 'pending'
    });

    // ✅ Log de auditoria
    console.log('✅ Checkout session created:', {
      user_id: user.id,
      session_id: session.id,
      amount,
      currency,
      item_type: itemType
    });

    return Response.json({ 
      sessionId: session.id,
      url: session.url,
      amount_charged: amount // ✅ Retornar para validação no cliente
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return Response.json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    }, { status: 500 });
  }
});