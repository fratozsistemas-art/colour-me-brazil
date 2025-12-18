import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, itemType } = await req.json();

    // Check if user has purchased this item
    const purchases = await base44.entities.Purchase.filter({
      user_id: user.id,
      item_id: itemId,
      item_type: itemType,
      status: 'completed'
    });

    return Response.json({ 
      isPurchased: purchases.length > 0,
      purchase: purchases[0] || null
    });
  } catch (error) {
    console.error('Check purchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});