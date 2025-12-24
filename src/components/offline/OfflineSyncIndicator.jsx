import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const handleSyncComplete = (event) => {
      setSyncStatus(event.detail);
      setTimeout(() => setSyncStatus(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sync-complete', handleSyncComplete);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
    };
  }, []);

  if (!syncStatus && isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Card className="p-4 shadow-lg border-2 bg-white">
          <div className="flex items-center gap-3">
            {isOnline ? (
              syncStatus ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Sync Complete</p>
                    <p className="text-xs text-gray-600">
                      {syncStatus.results.coloringSessions + 
                       syncStatus.results.readingProgress +
                       syncStatus.results.annotations +
                       syncStatus.results.bookmarks} items synced
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Syncing...</p>
                    <p className="text-xs text-gray-600">Uploading offline data</p>
                  </div>
                </>
              )
            ) : (
              <>
                <CloudOff className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Offline Mode</p>
                  <p className="text-xs text-gray-600">Changes saved locally</p>
                </div>
              </>
            )}
            
            {syncStatus && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Details'}
              </Button>
            )}
          </div>

          {showDetails && syncStatus && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 pt-3 border-t text-xs space-y-1"
            >
              <div className="flex justify-between">
                <span className="text-gray-600">Coloring:</span>
                <span className="font-semibold">{syncStatus.results.coloringSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reading:</span>
                <span className="font-semibold">{syncStatus.results.readingProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annotations:</span>
                <span className="font-semibold">{syncStatus.results.annotations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bookmarks:</span>
                <span className="font-semibold">{syncStatus.results.bookmarks}</span>
              </div>
              {syncStatus.results.errors.length > 0 && (
                <div className="flex items-start gap-2 mt-2 text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{syncStatus.results.errors.length} errors occurred</span>
                </div>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}