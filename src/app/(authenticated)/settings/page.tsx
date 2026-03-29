"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { getSettings, updateSettings } from "@/lib/actions";
import { Save, Building2, MapPin, Clock } from "lucide-react";
import { US_STATES } from "@/lib/utils";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    returnStreet: "",
    returnCity: "",
    returnState: "",
    returnZip: "",
    leadTimeDays: 14,
    cardSize: "5x7",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getSettings();
    setForm({
      businessName: settings.businessName,
      returnStreet: settings.returnStreet,
      returnCity: settings.returnCity,
      returnState: settings.returnState,
      returnZip: settings.returnZip,
      leadTimeDays: settings.leadTimeDays,
      cardSize: settings.cardSize,
    });
    setLoading(false);
  };

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({
      ...form,
      leadTimeDays: Number(form.leadTimeDays),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading)
    return (
      <div className="text-center py-12 text-gray-500">Loading...</div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Configure your business info and card preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Settings saved!
            </span>
          )}
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Business Info */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-500" />
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              label="Business Name"
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              placeholder="Your Company Name"
            />
            <p className="text-xs text-gray-400 mt-1">
              This appears on card signatures (e.g., &quot;From Your Company
              Name&quot;)
            </p>
          </CardContent>
        </Card>

        {/* Return Address */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <MapPin className="w-5 h-5 text-green-500" />
            <CardTitle>Return Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Street Address"
              value={form.returnStreet}
              onChange={(e) => update("returnStreet", e.target.value)}
              placeholder="123 Main Street"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                value={form.returnCity}
                onChange={(e) => update("returnCity", e.target.value)}
                placeholder="Boston"
              />
              <Select
                label="State"
                value={form.returnState}
                onChange={(e) => update("returnState", e.target.value)}
              >
                <option value="">Select state...</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Input
                label="ZIP Code"
                value={form.returnZip}
                onChange={(e) => update("returnZip", e.target.value)}
                placeholder="02101"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-gray-400">
              Used as the return address on generated envelopes
            </p>
          </CardContent>
        </Card>

        {/* Card Preferences */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <CardTitle>Card Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Lead Time (days)"
                type="number"
                min={1}
                max={90}
                value={form.leadTimeDays}
                onChange={(e) => update("leadTimeDays", e.target.value)}
              />
              <Select
                label="Card Size"
                value={form.cardSize}
                onChange={(e) => update("cardSize", e.target.value)}
              >
                <option value="5x7">5&quot; x 7&quot; (Standard)</option>
                <option value="4x6">4&quot; x 6&quot;</option>
                <option value="A6">A6 (4.1&quot; x 5.8&quot;)</option>
              </Select>
            </div>
            <p className="text-xs text-gray-400">
              Lead time determines how many days before an occasion cards appear
              in your queue. For example, 14 days means birthday cards show up 2
              weeks before the birthday.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
