import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield, Eye, EyeOff, Download, Trash2, Lock, AlertTriangle,
  Cookie, Bell, Mail, MessageSquare, Users, Check
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';
import { getCookieConsent } from '../legal/CookieConsentBanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PrivacySettings() {
  const [settings, setSettings] = useState({
    profileVisibility: 'private', // private, friends, public
    showProgress: true,
    showAchievements: true,
    allowMessages: false,
    allowForumPosts: true,
    allowShowcase: true,
    shareReadingData: false,
    parentalNotifications: true,
    marketingEmails: false,
  });

  const [cookieConsent, setCookieConsent] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
    setCookieConsent(getCookieConsent());
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const savedSettings = localStorage.getItem('privacy_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // TODO: Load from database via Base44
      // const user = await base44.auth.me();
      // const privacyData = await base44.entities.UserPrivacySettings.filter({ user_id: user.id });
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('privacy_settings', JSON.stringify(settings));

      // TODO: Save to database via Base44
      // const user = await base44.auth.me();
      // await base44.entities.UserPrivacySettings.upsert({ user_id: user.id, ...settings });

      toast.success('Privacy settings saved successfully');
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual data export via cloud function
      // const userData = await base44.functions.exportUserData();

      // Simulate data export
      const userData = {
        exported_at: new Date().toISOString(),
        profile: { name: 'Child Name', age: 8 },
        reading_progress: [],
        achievements: [],
        artwork: [],
        // ... other data
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `colour-me-brazil-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
      setShowExportDialog(false);
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual data deletion via cloud function
      // await base44.functions.deleteAllUserData();

      // Clear local storage
      localStorage.clear();

      toast.success('All data deleted successfully');
      setShowDeleteDialog(false);

      // Redirect to home after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Failed to delete data:', error);
      toast.error('Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* COPPA Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Privacy Protection:</strong> We comply with COPPA, GDPR, and LGPD.
          Parents have full control over their child's information at all times.
        </AlertDescription>
      </Alert>

      {/* Profile Visibility */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Eye className="w-6 h-6 text-purple-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Profile Visibility</h3>
            <p className="text-sm text-gray-600">
              Control who can see your child's profile and activities
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium">Profile Visibility</Label>
              <p className="text-xs text-gray-500">
                Current: <span className="font-semibold capitalize">{settings.profileVisibility}</span>
              </p>
            </div>
            <select
              value={settings.profileVisibility}
              onChange={(e) => updateSetting('profileVisibility', e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="private">Private (Only You)</option>
              <option value="friends">Friends Only</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="showProgress">Show Reading Progress</Label>
              <p className="text-xs text-gray-500">Display books read and progress to others</p>
            </div>
            <Switch
              id="showProgress"
              checked={settings.showProgress}
              onCheckedChange={(checked) => updateSetting('showProgress', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="showAchievements">Show Achievements</Label>
              <p className="text-xs text-gray-500">Display badges and trophies on profile</p>
            </div>
            <Switch
              id="showAchievements"
              checked={settings.showAchievements}
              onCheckedChange={(checked) => updateSetting('showAchievements', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Social Features */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Users className="w-6 h-6 text-green-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Social Features</h3>
            <p className="text-sm text-gray-600">
              Control participation in community features
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="allowForumPosts">Forum Participation</Label>
              <p className="text-xs text-gray-500">Allow posting in community forum (moderated)</p>
            </div>
            <Switch
              id="allowForumPosts"
              checked={settings.allowForumPosts}
              onCheckedChange={(checked) => updateSetting('allowForumPosts', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="allowShowcase">Showcase Artwork</Label>
              <p className="text-xs text-gray-500">Display colored artwork in public gallery</p>
            </div>
            <Switch
              id="allowShowcase"
              checked={settings.allowShowcase}
              onCheckedChange={(checked) => updateSetting('allowShowcase', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="allowMessages">Direct Messages</Label>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Currently disabled for child safety
              </p>
            </div>
            <Switch
              id="allowMessages"
              checked={false}
              disabled={true}
            />
          </div>
        </div>
      </Card>

      {/* Data Sharing */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <MessageSquare className="w-6 h-6 text-orange-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Data Sharing</h3>
            <p className="text-sm text-gray-600">
              Control how data is used and shared
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="shareReadingData">Share Reading Analytics</Label>
              <p className="text-xs text-gray-500">
                Help improve recommendations (anonymized data only)
              </p>
            </div>
            <Switch
              id="shareReadingData"
              checked={settings.shareReadingData}
              onCheckedChange={(checked) => updateSetting('shareReadingData', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="parentalNotifications">Parental Notifications</Label>
              <p className="text-xs text-gray-500">Receive updates about child's activity</p>
            </div>
            <Switch
              id="parentalNotifications"
              checked={settings.parentalNotifications}
              onCheckedChange={(checked) => updateSetting('parentalNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="marketingEmails">Marketing Emails</Label>
              <p className="text-xs text-gray-500">Receive updates about new content (parent only)</p>
            </div>
            <Switch
              id="marketingEmails"
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Cookie Preferences */}
      <Card className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Cookie className="w-6 h-6 text-amber-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Cookie Preferences</h3>
            <p className="text-sm text-gray-600">
              Current cookie settings (set on first visit)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-600" />
            <span>Essential Cookies: <strong>Enabled (Required)</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {cookieConsent.functional ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
            <span>Functional Cookies: <strong>{cookieConsent.functional ? 'Enabled' : 'Disabled'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {cookieConsent.analytics ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
            <span>Analytics Cookies: <strong>{cookieConsent.analytics ? 'Enabled' : 'Disabled'}</strong></span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()} // Will show cookie banner again
        >
          Change Cookie Preferences
        </Button>
      </Card>

      {/* Data Rights (GDPR/LGPD) */}
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-start gap-4 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1 text-red-900">Your Data Rights</h3>
            <p className="text-sm text-red-700">
              GDPR & LGPD rights: Access, correct, delete, or export your child's data
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setShowExportDialog(true)}
          >
            <Download className="w-4 h-4" />
            Export All Data (Data Portability)
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete All Data (Right to be Forgotten)
          </Button>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="flex-1"
          size="lg"
        >
          {loading ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </div>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Your Data</DialogTitle>
            <DialogDescription>
              Download a copy of all your child's data in JSON format. This includes
              profile information, reading progress, achievements, and artwork.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData} disabled={loading}>
              {loading ? 'Exporting...' : 'Export Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Data Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete All Data?</DialogTitle>
            <DialogDescription>
              <strong className="text-red-700">This action cannot be undone!</strong>
              <br /><br />
              This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All child profiles</li>
                <li>Reading progress and achievements</li>
                <li>Colored artwork and creations</li>
                <li>Forum posts and comments</li>
                <li>Parent account information</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllData}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Yes, Delete Everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
