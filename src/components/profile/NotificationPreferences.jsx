import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Mail, Zap, Trophy, BookOpen } from 'lucide-react';

export default function NotificationPreferences({ profile, onUpdate, isUpdating }) {
  const [preferences, setPreferences] = useState({
    email_notifications: profile.email_notifications ?? true,
    daily_reminder: profile.daily_reminder ?? true,
    achievement_notifications: profile.achievement_notifications ?? true,
    new_content_alerts: profile.new_content_alerts ?? true,
    reading_goal_reminders: profile.reading_goal_reminders ?? true,
  });

  const handleSave = () => {
    onUpdate(preferences);
  };

  const togglePreference = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const notificationOptions = [
    {
      key: 'email_notifications',
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive updates and news via email',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      key: 'daily_reminder',
      icon: Bell,
      title: 'Daily Reading Reminder',
      description: 'Get reminded to read every day',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      key: 'achievement_notifications',
      icon: Trophy,
      title: 'Achievement Alerts',
      description: 'Be notified when you unlock achievements',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      key: 'new_content_alerts',
      icon: Zap,
      title: 'New Content Alerts',
      description: 'Get notified about new books and features',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      key: 'reading_goal_reminders',
      icon: BookOpen,
      title: 'Reading Goal Reminders',
      description: 'Reminders to help you reach your reading goals',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-600">Manage how you receive updates and reminders</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {notificationOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = preferences[option.key];

          return (
            <Card key={option.key} className={`p-6 transition-all ${isEnabled ? option.bg : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${isEnabled ? 'bg-white' : 'bg-gray-100'}`}>
                    <Icon className={`w-6 h-6 ${isEnabled ? option.color : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{option.title}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => togglePreference(option.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-yellow-700 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Browser Notifications</h4>
            <p className="text-sm text-yellow-800 mb-3">
              Enable browser notifications to get real-time updates even when you're not on this page.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if ('Notification' in window && Notification.permission !== 'granted') {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      new Notification('Notifications Enabled!', {
                        body: 'You will now receive browser notifications from Colour Me Brazil',
                        icon: '/favicon.ico'
                      });
                    }
                  });
                }
              }}
              className="border-yellow-300 text-yellow-900 hover:bg-yellow-100"
            >
              Enable Browser Notifications
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isUpdating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isUpdating ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}