import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active products
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    // Get all prices for these products
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true
        });

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          images: product.images,
          metadata: product.metadata,
          prices: prices.data.map(price => ({
            id: price.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            recurring: price.recurring,
            type: price.type
          }))
        };
      })
    );

    return Response.json({ products: productsWithPrices });

  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ 
      error: error.message || 'Failed to fetch products' 
    }, { status: 500 });
  }
});