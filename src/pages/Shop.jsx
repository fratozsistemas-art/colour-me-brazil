import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingCart, CreditCard, CheckCircle2, XCircle, Loader2, Package, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Shop() {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/';
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['stripe-products'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getStripeProducts', {});
      return response.data;
    },
    enabled: !!user
  });

  // Fetch user's purchase history
  const { data: purchases = [], refetch: refetchPurchases } = useQuery({
    queryKey: ['purchases', user?.id],
    queryFn: async () => {
      return await base44.entities.Purchase.filter({ user_id: user.id });
    },
    enabled: !!user
  });

  // Check for payment status in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseStatus = urlParams.get('purchase');
    const sessionId = urlParams.get('session_id');

    if (purchaseStatus === 'success') {
      toast.success('Purchase completed successfully! 🎉');
      refetchPurchases();
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (purchaseStatus === 'cancelled') {
      toast.error('Purchase was cancelled');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handlePurchase = async (product, price) => {
    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        priceId: price.id,
        productId: product.id,
        successUrl: `${window.location.origin}/Shop?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/Shop?purchase=cancelled`
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to initiate purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatInterval = (recurring) => {
    if (!recurring) return '';
    return `/${recurring.interval}`;
  };

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🛍️ Shop
        </h1>
        <p className="text-gray-600">
          Purchase premium content and unlock exclusive features
        </p>
      </div>

      {/* Products Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Products</h2>
        
        {productsLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : productsData?.products?.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
            <p className="text-gray-500">Check back soon for new content!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsData?.products?.map((product) => (
              <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  )}
                </div>

                {/* Prices */}
                <div className="space-y-3">
                  {product.prices.map((price) => (
                    <div key={price.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-800">
                          {formatPrice(price.unit_amount, price.currency)}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {formatInterval(price.recurring)}
                        </span>
                      </div>
                      <Button
                        onClick={() => handlePurchase(product, price)}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Now
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Purchase History */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Purchase History</h2>
        
        {purchases.length === 0 ? (
          <Card className="p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No purchases yet</h3>
            <p className="text-gray-500">Your purchase history will appear here</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).map((purchase) => (
              <Card key={purchase.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {purchase.product_name || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatPrice(purchase.amount, purchase.currency)} • {purchase.purchase_type === 'subscription' ? 'Subscription' : 'One-time'}
                    </p>
                    <p className="text-xs text-gray-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(purchase.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    {purchase.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    )}
                    {purchase.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                    {purchase.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Failed
                      </span>
                    )}
                    {purchase.status === 'refunded' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Refunded
                      </span>
                    )}
                    {purchase.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                        <XCircle className="w-4 h-4" />
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}