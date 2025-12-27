import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active products from Stripe
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    // Get prices for all products
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
    });

    // Combine products with their prices
    const productsWithPrices = products.data.map(product => {
      const productPrices = prices.data.filter(price => price.product === product.id);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        metadata: product.metadata,
        prices: productPrices.map(price => ({
          id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          type: price.type,
          interval: price.recurring?.interval,
        })),
      };
    });

    return Response.json({ products: productsWithPrices });
  } catch (error) {
    console.error('Error fetching Stripe products:', error);
    return Response.json({ 
      error: error.message || 'Failed to fetch products' 
    }, { status: 500 });
  }
});