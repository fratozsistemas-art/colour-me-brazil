import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, User, Bell, Shield, Palette } from 'lucide-react';
import OfflineSettings from '../components/settings/OfflineSettings';
import AccessibilitySettings from '../components/accessibility/AccessibilitySettings';

export default function Settings() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your app preferences and offline content</p>
      </div>

      <Tabs defaultValue="offline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
          <TabsTrigger value="offline" className="flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            <span className="hidden sm:inline">Offline</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Reading</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2" disabled>
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2" disabled>
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2" disabled>
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offline">
          <OfflineSettings />
        </TabsContent>

        <TabsContent value="accessibility">
          <Card className="p-6">
            <AccessibilitySettings />
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="p-6">
            <p className="text-gray-600">Profile settings coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <p className="text-gray-600">Notification settings coming soon...</p>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-6">
            <p className="text-gray-600">Privacy settings coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}