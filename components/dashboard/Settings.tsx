"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Globe,
  Bell,
  Shield,
  Save,
  RefreshCw,
  Settings as SettingsIcon,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { languages } from "@/lib/languageData";

interface SettingsFormData {
  nativeLanguage: string;
  learningLanguage: string;
  proficiencyLevel: string;
  dailyGoal: number;
  notifications: boolean;
  theme: "light" | "dark" | "system";
  audioEnabled: boolean;
  autoPlay: boolean;
  emailNotifications: {
    dailyReminders: boolean;
    weeklyProgress: boolean;
    achievements: boolean;
  };
  privacySettings: {
    publicProfile: boolean;
    showProgress: boolean;
    shareAchievements: boolean;
  };
}

const defaultSettings: SettingsFormData = {
  nativeLanguage: "English",
  learningLanguage: "Spanish",
  proficiencyLevel: "A1",
  dailyGoal: 50,
  notifications: true,
  theme: "system",
  audioEnabled: true,
  autoPlay: true,
  emailNotifications: {
    dailyReminders: true,
    weeklyProgress: true,
    achievements: true,
  },
  privacySettings: {
    publicProfile: false,
    showProgress: true,
    shareAchievements: true,
  },
};

const Settings = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsFormData>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSettings = async () => {
    setIsLoading(true);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      toast.success("Settings updated successfully!");
      setHasChanges(false);
      
    } catch (err) {
      // Show error message with specific error details
      const errorMessage = err instanceof Error ? err.message : "Failed to update settings";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = useCallback(<K extends keyof SettingsFormData>(
    key: K,
    value: SettingsFormData[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.success("Settings reset to default");
  }, []);

  // Profile completion calculation
  const calculateProfileCompletion = useCallback(() => {
    const requiredFields = [
      settings.nativeLanguage,
      settings.learningLanguage,
      settings.proficiencyLevel,
      settings.dailyGoal,
      user?.firstName,
      user?.lastName,
      user?.primaryEmailAddress,
    ];

    const completedFields = requiredFields.filter(field => field).length;
    return (completedFields / requiredFields.length) * 100;
  }, [settings, user]);

  return (
    <div className="space-y-6">
      {/* Header with Profile Completion */}
      <div className="bg-gradient-to-r from-background via-background/95 to-primary/10 p-8 rounded-xl border border-foreground/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Account{" "}
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Settings
              </span>
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <SettingsIcon className="w-8 h-8 text-primary" />
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(calculateProfileCompletion())}%
            </span>
          </div>
          <Progress value={calculateProfileCompletion()} className="h-2" />
        </div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-primary/10 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-primary">
              <AlertCircle className="w-5 h-5" />
              <span>You have unsaved changes</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettings(defaultSettings)}
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={updateSettings}
                disabled={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Settings Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Profile Settings */}
        <SettingsSection
          title="Profile Settings"
          description="Manage your personal information"
          icon={User}
        >
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input value={user?.firstName || ""} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input value={user?.lastName || ""} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input 
                value={user?.primaryEmailAddress?.emailAddress || ""} 
                disabled 
                className="bg-muted/50"
              />
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5">
              <div>
                <p className="font-medium">Verify Account</p>
                <p className="text-sm text-muted-foreground">
                  Verify your account for additional features
                </p>
              </div>
              <Button variant="outline" size="sm">
                Verify <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </SettingsSection>

        {/* Language Settings */}
        <SettingsSection
          title="Language Preferences"
          description="Configure your language learning settings"
          icon={Globe}
        >
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Native Language</label>
                <Select
                  value={settings.nativeLanguage}
                  onValueChange={(value) => handleSettingChange("nativeLanguage", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.name}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Learning Language</label>
                <Select
                  value={settings.learningLanguage}
                  onValueChange={(value) => handleSettingChange("learningLanguage", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.name}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Learning Goal</label>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={settings.dailyGoal}
                    onChange={(e) => handleSettingChange("dailyGoal", parseInt(e.target.value) || 0)}
                    min={0}
                    max={200}
                  />
                  <span className="text-sm text-muted-foreground flex items-center">
                    words/day
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          title="Notification Preferences"
          description="Manage your notification settings"
          icon={Bell}
        >
          <div className="space-y-4">
            <PreferenceToggle
              title="Daily Reminders"
              description="Receive daily practice reminders"
              isEnabled={settings.emailNotifications.dailyReminders}
              onToggle={(enabled) =>
                handleSettingChange("emailNotifications", {
                  ...settings.emailNotifications,
                  dailyReminders: enabled,
                })
              }
            />
            <PreferenceToggle
              title="Weekly Progress"
              description="Get weekly progress reports"
              isEnabled={settings.emailNotifications.weeklyProgress}
              onToggle={(enabled) =>
                handleSettingChange("emailNotifications", {
                  ...settings.emailNotifications,
                  weeklyProgress: enabled,
                })
              }
            />
            <PreferenceToggle
              title="Achievement Alerts"
              description="Notifications for new achievements"
              isEnabled={settings.emailNotifications.achievements}
              onToggle={(enabled) =>
                handleSettingChange("emailNotifications", {
                  ...settings.emailNotifications,
                  achievements: enabled,
                })
              }
            />
          </div>
        </SettingsSection>

        {/* Privacy Settings */}
        <SettingsSection
          title="Privacy Settings"
          description="Control your privacy preferences"
          icon={Shield}
        >
          <div className="space-y-4">
            <PreferenceToggle
              title="Public Profile"
              description="Make your profile visible to other learners"
              isEnabled={settings.privacySettings.publicProfile}
              onToggle={(enabled) =>
                handleSettingChange("privacySettings", {
                  ...settings.privacySettings,
                  publicProfile: enabled,
                })
              }
            />
            <PreferenceToggle
              title="Show Progress"
              description="Display your learning progress publicly"
              isEnabled={settings.privacySettings.showProgress}
              onToggle={(enabled) =>
                handleSettingChange("privacySettings", {
                  ...settings.privacySettings,
                  showProgress: enabled,
                })
              }
            />
            <PreferenceToggle
              title="Share Achievements"
              description="Allow others to see your achievements"
              isEnabled={settings.privacySettings.shareAchievements}
              onToggle={(enabled) =>
                handleSettingChange("privacySettings", {
                  ...settings.privacySettings,
                  shareAchievements: enabled,
                })
              }
            />
          </div>
        </SettingsSection>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-foreground/10">
        <Button
          variant="outline"
          onClick={resetSettings}
          className="text-destructive"
        >
          Reset to Default
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setSettings(defaultSettings)}
            disabled={isLoading || !hasChanges}
          >
            Cancel
          </Button>
          <Button
            onClick={updateSettings}
            disabled={isLoading || !hasChanges}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SettingsSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
}) => (
  <Card className="p-6">
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    {children}
  </Card>
);

interface PreferenceToggleProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const PreferenceToggle: React.FC<PreferenceToggleProps> = ({
  title,
  description,
  isEnabled,
  onToggle,
}) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className={`p-4 rounded-lg border transition-colors duration-200 ${
      isEnabled ? "border-primary bg-primary/5" : "border-foreground/10"
    } cursor-pointer`}
    onClick={() => onToggle(!isEnabled)}
  >
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div
        className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${
          isEnabled ? "bg-primary" : "bg-foreground/10"
        }`}
      >
        <motion.div
          className="w-4 h-4 bg-background rounded-full"
          animate={{ x: isEnabled ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  </motion.div>
);

export default Settings;