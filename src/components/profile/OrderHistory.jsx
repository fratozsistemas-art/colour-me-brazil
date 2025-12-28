import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Calendar, CreditCard, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderHistory({ userId }) {
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases', userId],
    queryFn: () => base44.entities.Purchase.filter({ user_id: userId }),
    enabled: !!userId
  });

  const sortedPurchases = [...purchases].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'refunded':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Orders Yet</h3>
        <p className="text-gray-500">Your purchase history will appear here</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Order History</h3>
        <span className="text-sm text-gray-500">{purchases.length} order{purchases.length !== 1 ? 's' : ''}</span>
      </div>

      {sortedPurchases.map((purchase, index) => (
        <motion.div
          key={purchase.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {purchase.item_type === 'book' ? 'Book Purchase' : 
                     purchase.item_type === 'collection' ? 'Collection Purchase' : 
                     'Premium Feature'}
                  </h4>
                  <p className="text-sm text-gray-500">Order #{purchase.id.slice(0, 8)}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(purchase.status)}`}>
                {getStatusIcon(purchase.status)}
                <span className="capitalize">{purchase.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(purchase.created_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span className="uppercase">{purchase.currency}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  ${(purchase.amount / 100).toFixed(2)}
                </div>
                {purchase.stripe_payment_intent_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    Payment ID: {purchase.stripe_payment_intent_id.slice(0, 16)}...
                  </p>
                )}
              </div>
            </div>

            {purchase.status === 'completed' && (
              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // TODO: Generate invoice/receipt
                    alert('Receipt download coming soon!');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
}