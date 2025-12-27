import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Mail, MessageSquare, Trophy, BookOpen, Gift, AlertCircle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [settings, setSettings] = useState({
    // Email Notifications (Parent)
    email_daily_summary: true,
    email_weekly_report: true,
    email_achievements: true,
    email_new_content: false,
    email_security_alerts: true,
    email_marketing: false,
    
    // In-App Notifications (Child)
    app_achievements: true,
    app_new_books: true,
    app_challenges: true,
    app_forum_replies: false,
    app_friend_activity: false,
    app_rewards: true,
    
    // Push Notifications (if PWA installed)
    push_enabled: false,
    push_reading_reminders: false,
    push_daily_challenge: false,
    push_achievements: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
    loadNotificationSettings();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const loadNotificationSettings = () => {
    try {
      const saved = localStorage.getItem('notification_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      localStorage.setItem('notification_settings', JSON.stringify(settings));
      
      // TODO: Save to database
      // const user = await base44.auth.me();
      // await base44.entities.NotificationSettings.upsert({ user_id: user.id, ...settings });
      
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications not supported in this browser');
      return;
    }

    if (Notification.permission === 'granted') {
      toast.success('Notifications already enabled');
      updateSetting('push_enabled', true);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notifications enabled successfully');
        updateSetting('push_enabled', true);
        
        // Show test notification
        new Notification('Colour Me Brazil', {
          body: 'Notifications are now enabled! You\'ll receive updates about achievements and new content.',
          icon: '/icons/icon-192x192.png',
        });
      } else {
        toast.error('Notification permission denied');
        updateSetting('push_enabled', false);
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const disableNotifications = () => {
    updateSetting('push_enabled', false);
    updateSetting('push_reading_reminders', false);
    updateSetting('push_daily_challenge', false);
    updateSetting('push_achievements', false);
    toast.success('Push notifications disabled');
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Browser Notification Permission */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Bell className="w-6 h-6 text-blue-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Push Notifications</h3>
            <p className="text-sm text-gray-600">
              Enable browser notifications for real-time updates
            </p>
          </div>
        </div>

        {notificationPermission === 'default' && (
          <Alert className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Browser notifications are not yet configured. Click below to enable them.
            </AlertDescription>
          </Alert>
        )}

        {notificationPermission === 'denied' && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <X className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-900">
              Notifications are blocked. Please enable them in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {notificationPermission === 'granted' && settings.push_enabled && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-900">
              Push notifications are enabled
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {notificationPermission !== 'granted' ? (
            <Button onClick={requestNotificationPermission} className="gap-2">
              <Bell className="w-4 h-4" />
              Enable Push Notifications
            </Button>
          ) : (
            <Button 
              onClick={disableNotifications} 
              variant="outline"
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Disable Push Notifications
            </Button>
          )}
        </div>

        {settings.push_enabled && (
          <div className="mt-4 space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="push_reading_reminders">Reading Reminders</Label>
                <p className="text-xs text-gray-500">Daily reminder to read a story</p>
              </div>
              <Switch
                id="push_reading_reminders"
                checked={settings.push_reading_reminders}
                onCheckedChange={(checked) => updateSetting('push_reading_reminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="push_daily_challenge">Daily Challenge</Label>
                <p className="text-xs text-gray-500">Notification when new challenge available</p>
              </div>
              <Switch
                id="push_daily_challenge"
                checked={settings.push_daily_challenge}
                onCheckedChange={(checked) => updateSetting('push_daily_challenge', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="push_achievements">Achievement Unlocked</Label>
                <p className="text-xs text-gray-500">Notify when earning badges or trophies</p>
              </div>
              <Switch
                id="push_achievements"
                checked={settings.push_achievements}
                onCheckedChange={(checked) => updateSetting('push_achievements', checked)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Email Notifications (Parent) */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Mail className="w-6 h-6 text-green-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Email Notifications (Parent)</h3>
            <p className="text-sm text-gray-600">
              Receive updates about your child's progress via email
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email_daily_summary">Daily Summary</Label>
              <p className="text-xs text-gray-500">Daily recap of reading activity</p>
            </div>
            <Switch
              id="email_daily_summary"
              checked={settings.email_daily_summary}
              onCheckedChange={(checked) => updateSetting('email_daily_summary', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email_weekly_report">Weekly Report</Label>
              <p className="text-xs text-gray-500">Comprehensive weekly progress report</p>
            </div>
            <Switch
              id="email_weekly_report"
              checked={settings.email_weekly_report}
              onCheckedChange={(checked) => updateSetting('email_weekly_report', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email_achievements">Achievement Notifications</Label>
              <p className="text-xs text-gray-500">When your child unlocks achievements</p>
            </div>
            <Switch
              id="email_achievements"
              checked={settings.email_achievements}
              onCheckedChange={(checked) => updateSetting('email_achievements', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email_new_content">New Content Updates</Label>
              <p className="text-xs text-gray-500">Notification when new books are added</p>
            </div>
            <Switch
              id="email_new_content"
              checked={settings.email_new_content}
              onCheckedChange={(checked) => updateSetting('email_new_content', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email_security_alerts">Security Alerts</Label>
              <p className="text-xs text-gray-500 font-semibold text-red-600">
                Recommended: Account security notifications
              </p>
            </div>
            <Switch
              id="email_security_alerts"
              checked={settings.email_security_alerts}
              onCheckedChange={(checked) => updateSetting('email_security_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="email_marketing">Marketing Emails</Label>
              <p className="text-xs text-gray-500">Promotions and special offers</p>
            </div>
            <Switch
              id="email_marketing"
              checked={settings.email_marketing}
              onCheckedChange={(checked) => updateSetting('email_marketing', checked)}
            />
          </div>
        </div>
      </Card>

      {/* In-App Notifications (Child) */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <MessageSquare className="w-6 h-6 text-purple-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">In-App Notifications (Child)</h3>
            <p className="text-sm text-gray-600">
              Notifications shown while using the app
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <div>
                <Label htmlFor="app_achievements">Achievements</Label>
                <p className="text-xs text-gray-500">Show achievement unlocked notifications</p>
              </div>
            </div>
            <Switch
              id="app_achievements"
              checked={settings.app_achievements}
              onCheckedChange={(checked) => updateSetting('app_achievements', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <div>
                <Label htmlFor="app_new_books">New Books</Label>
                <p className="text-xs text-gray-500">Notify about newly added stories</p>
              </div>
            </div>
            <Switch
              id="app_new_books"
              checked={settings.app_new_books}
              onCheckedChange={(checked) => updateSetting('app_new_books', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1 flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-600" />
              <div>
                <Label htmlFor="app_challenges">Daily Challenges</Label>
                <p className="text-xs text-gray-500">Notify about daily quests and challenges</p>
              </div>
            </div>
            <Switch
              id="app_challenges"
              checked={settings.app_challenges}
              onCheckedChange={(checked) => updateSetting('app_challenges', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="app_rewards">Rewards Unlocked</Label>
              <p className="text-xs text-gray-500">When earning coins or unlocking rewards</p>
            </div>
            <Switch
              id="app_rewards"
              checked={settings.app_rewards}
              onCheckedChange={(checked) => updateSetting('app_rewards', checked)}
            />
          </div>
        </div>
      </Card>

      {/* COPPA Compliance Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Privacy Note:</strong> We never send marketing or promotional notifications
          directly to children. All email notifications are sent to the parent/guardian email address.
        </AlertDescription>
      </Alert>

      {/* Save Button */}
      <Button
        onClick={saveSettings}
        disabled={loading}
        size="lg"
        className="w-full"
      >
        {loading ? 'Saving...' : 'Save Notification Preferences'}
      </Button>
    </div>
  );
}
