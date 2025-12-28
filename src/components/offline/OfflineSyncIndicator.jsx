import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  WifiOff, Wifi, Cloud, CloudOff, CheckCircle2, 
  AlertCircle, Loader2, RefreshCcw, ChevronDown, ChevronUp 
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnsyncedCount, syncOfflineData } from '../offlineManager.jsx';

export default function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [pendingCount, setPendingCount] = useState(0);
  const [syncResults, setSyncResults] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    // Update pending count
    updatePendingCount();

    // Online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are now offline. Changes will be saved locally.');
    };

    // Sync event listeners
    const handleSyncStarted = () => {
      setSyncStatus('syncing');
      setSyncResults(null);
    };

    const handleSyncComplete = (event) => {
      const { results } = event.detail;
      setSyncStatus('success');
      setSyncResults(results);
      setLastSyncTime(new Date());
      
      const total = results.coloringSessions + 
                   results.readingProgress + 
                   results.annotations + 
                   results.bookmarks;

      if (total > 0) {
        toast.success(`Successfully synced ${total} item${total > 1 ? 's' : ''}!`);
      }
      
      updatePendingCount();
      
      // Reset to idle after 5 seconds
      setTimeout(() => {
        if (pendingCount === 0) {
          setSyncStatus('idle');
        }
      }, 5000);
    };

    const handleSyncError = (event) => {
      const { errors, partial, willRetry, retryCount } = event.detail;
      setSyncStatus('error');
      setSyncResults(null);
      
      if (partial) {
        toast.error(`Sync completed with ${errors?.length || 0} error(s)`);
      } else if (willRetry) {
        toast.error(`Sync failed. Retrying... (Attempt ${retryCount + 1})`);
      } else {
        toast.error('Sync failed. Will retry later.');
      }
      
      updatePendingCount();
    };

    const handleSyncIdle = () => {
      setSyncStatus('idle');
      updatePendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sync-started', handleSyncStarted);
    window.addEventListener('offline-sync-complete', handleSyncComplete);
    window.addEventListener('offline-sync-error', handleSyncError);
    window.addEventListener('offline-sync-idle', handleSyncIdle);

    // Update count every 30 seconds
    const intervalId = setInterval(updatePendingCount, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sync-started', handleSyncStarted);
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
      window.removeEventListener('offline-sync-error', handleSyncError);
      window.removeEventListener('offline-sync-idle', handleSyncIdle);
      clearInterval(intervalId);
    };
  }, [pendingCount]);

  const updatePendingCount = async () => {
    try {
      const count = await getUnsyncedCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Error getting unsynced count:', error);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      const result = await syncOfflineData();
      if (result.success) {
        handleSyncComplete({ detail: result });
      } else {
        handleSyncError({ detail: { errors: [], partial: false } });
      }
    } catch (error) {
      handleSyncError({ detail: { errors: [], partial: false } });
    }
  };

  // Don't show if no pending items and idle/success
  if (pendingCount === 0 && (syncStatus === 'idle' || syncStatus === 'success') && isOnline) {
    return null;
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (syncStatus === 'syncing') return <Loader2 className="w-4 h-4 animate-spin" />;
    if (syncStatus === 'success') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (syncStatus === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Cloud className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline Mode';
    if (syncStatus === 'syncing') return 'Syncing...';
    if (syncStatus === 'success') return 'Synced';
    if (syncStatus === 'error') return 'Sync Failed';
    if (pendingCount > 0) return `${pendingCount} item${pendingCount > 1 ? 's' : ''} pending`;
    return 'All synced';
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-gray-100 border-gray-300';
    if (syncStatus === 'syncing') return 'bg-blue-50 border-blue-300';
    if (syncStatus === 'success') return 'bg-green-50 border-green-300';
    if (syncStatus === 'error') return 'bg-red-50 border-red-300';
    if (pendingCount > 0) return 'bg-amber-50 border-amber-300';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40 max-w-sm"
    >
      <Card className={`shadow-lg ${getStatusColor()} border-2`}>
        <div className="p-3">
          {/* Main Status Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
            
            <div className="flex items-center gap-1">
              {isOnline && pendingCount > 0 && syncStatus !== 'syncing' && (
                <Button
                  onClick={handleManualSync}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                >
                  <RefreshCcw className="w-3 h-3" />
                </Button>
              )}
              
              {syncResults && (
                <Button
                  onClick={() => setExpanded(!expanded)}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                >
                  {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </Button>
              )}
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && syncResults && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-gray-200 space-y-2"
              >
                {syncResults.coloringSessions > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Coloring Sessions</span>
                    <Badge variant="outline" className="text-xs">
                      {syncResults.coloringSessions}
                    </Badge>
                  </div>
                )}
                
                {syncResults.readingProgress > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Reading Progress</span>
                    <Badge variant="outline" className="text-xs">
                      {syncResults.readingProgress}
                    </Badge>
                  </div>
                )}
                
                {syncResults.annotations > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Annotations</span>
                    <Badge variant="outline" className="text-xs">
                      {syncResults.annotations}
                    </Badge>
                  </div>
                )}
                
                {syncResults.bookmarks > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Bookmarks</span>
                    <Badge variant="outline" className="text-xs">
                      {syncResults.bookmarks}
                    </Badge>
                  </div>
                )}

                {syncResults.errors && syncResults.errors.length > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600">Errors</span>
                    <Badge variant="destructive" className="text-xs">
                      {syncResults.errors.length}
                    </Badge>
                  </div>
                )}

                {lastSyncTime && (
                  <div className="text-xs text-gray-500 text-center pt-1">
                    Last synced: {lastSyncTime.toLocaleTimeString()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offline Warning */}
          {!isOnline && pendingCount > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <CloudOff className="w-3 h-3" />
                {pendingCount} change{pendingCount > 1 ? 's' : ''} will sync when online
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}