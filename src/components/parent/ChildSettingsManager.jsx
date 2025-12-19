import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Clock, 
  CheckCircle2, 
  Save,
  BookOpen,
  Palette,
  MessageSquare,
  Sparkles,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_FEATURES = [
  { id: 'reading', label: 'Reading', icon: BookOpen, description: 'Access to book library and reading' },
  { id: 'coloring', label: 'Coloring', icon: Palette, description: 'Coloring pages and art tools' },
  { id: 'quizzes', label: 'Quizzes', icon: Trophy, description: 'Interactive quizzes and challenges' },
  { id: 'showcase', label: 'Showcase', icon: Sparkles, description: 'Share artwork in public showcase' },
  { id: 'forum', label: 'Forum', icon: MessageSquare, description: 'Participate in community forum' },
];

export default function ChildSettingsManager({ childProfile, parentAccount }) {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    content_approval_required: parentAccount?.content_approval_required || false,
    screen_time_limit: parentAccount?.screen_time_limit || 0,
    allowed_features: parentAccount?.allowed_features || ['reading', 'coloring', 'quizzes', 'showcase', 'forum']
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.entities.ParentAccount.update(parentAccount.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['parentAccount']);
      toast.success('Settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    }
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  const toggleFeature = (featureId) => {
    const currentFeatures = settings.allowed_features || [];
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(f => f !== featureId)
      : [...currentFeatures, featureId];
    
    setSettings({ ...settings, allowed_features: newFeatures });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Content & Safety Settings</h3>
            <p className="text-sm text-gray-600">
              Manage what {childProfile?.child_name} can access
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Content Approval */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <Label className="text-base font-semibold">Content Approval Required</Label>
                <p className="text-sm text-gray-600 mt-1">
                  All content created by {childProfile?.child_name} must be approved before being shared publicly
                </p>
              </div>
            </div>
            <Switch
              checked={settings.content_approval_required}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, content_approval_required: checked })
              }
            />
          </div>

          {/* Screen Time Limit */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-orange-600" />
              <Label className="text-base font-semibold">Daily Screen Time Limit</Label>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                value={settings.screen_time_limit}
                onChange={(e) => 
                  setSettings({ ...settings, screen_time_limit: Number(e.target.value) })
                }
                className="w-32"
              />
              <span className="text-sm text-gray-600">
                minutes per day (0 = unlimited)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The app will lock after this time limit is reached each day
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Feature Access</h3>
          <p className="text-sm text-gray-600">
            Choose which features {childProfile?.child_name} can use
          </p>
        </div>

        <div className="grid gap-4">
          {AVAILABLE_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isEnabled = settings.allowed_features?.includes(feature.id);
            
            return (
              <div
                key={feature.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isEnabled
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    isEnabled ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isEnabled ? 'text-green-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${
                      isEnabled ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {feature.label}
                    </p>
                    <p className="text-xs text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => toggleFeature(feature.id)}
                />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}