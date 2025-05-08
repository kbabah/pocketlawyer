"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "sonner";
import { Bell, Mail, BellOff, Info } from "lucide-react";

export default function NotificationsPage() {
  const { user, updateEmailPreferences, sendEmailNotification } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    systemUpdates: true,
    chatSummaries: true,
    trialNotifications: true,
    marketingEmails: false
  });

  useEffect(() => {
    // Set initial preferences from user data
    if (user?.emailPreferences) {
      setPreferences({
        systemUpdates: user.emailPreferences.systemUpdates,
        chatSummaries: user.emailPreferences.chatSummaries,
        trialNotifications: user.emailPreferences.trialNotifications,
        marketingEmails: user.emailPreferences.marketingEmails,
      });
    }
  }, [user]);

  const handleTogglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const savePreferences = async () => {
    if (!user || !user.email) {
      toast.error(t("You need to be signed in to update preferences"));
      return;
    }
    
    try {
      setSaving(true);
      await updateEmailPreferences(preferences);
      toast.success(t("Email preferences updated successfully"));
    } catch (error) {
      console.error("Failed to update email preferences:", error);
      toast.error(t("Failed to update email preferences"));
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.isAnonymous) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("Email Notifications")}</CardTitle>
            <CardDescription>
              {t("You need to be signed in to manage email preferences")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/sign-in")} className="w-full">
              {t("Sign In")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-1">{t("Email Notifications")}</h1>
      <p className="text-muted-foreground mb-6">
        {t("Choose which emails you'd like to receive")}
      </p>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{t("Contact Information")}</CardTitle>
          <CardDescription>
            {t("Notifications will be sent to your email address")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-md">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-medium">{user.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{t("Notification Preferences")}</CardTitle>
          <CardDescription>
            {t("Manage what types of emails you receive")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">{t("System Updates")}</div>
              <div className="text-sm text-muted-foreground">
                {t("Important announcements and system changes")}
              </div>
            </div>
            <Switch 
              checked={preferences.systemUpdates}
              onCheckedChange={() => handleTogglePreference("systemUpdates")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">{t("Chat Summaries")}</div>
              <div className="text-sm text-muted-foreground">
                {t("Receive summaries of your legal conversations")}
              </div>
            </div>
            <Switch 
              checked={preferences.chatSummaries}
              onCheckedChange={() => handleTogglePreference("chatSummaries")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">{t("Trial Notifications")}</div>
              <div className="text-sm text-muted-foreground">
                {t("Updates about your trial status and usage")}
              </div>
            </div>
            <Switch 
              checked={preferences.trialNotifications}
              onCheckedChange={() => handleTogglePreference("trialNotifications")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">{t("Marketing Emails")}</div>
              <div className="text-sm text-muted-foreground">
                {t("News, updates, and special offers")}
              </div>
            </div>
            <Switch 
              checked={preferences.marketingEmails}
              onCheckedChange={() => handleTogglePreference("marketingEmails")}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            {t("Back")}
          </Button>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? t("Saving...") : t("Save Preferences")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}