"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { createRecipient, updateRecipient } from "@/lib/actions";
import { US_STATES, HOLIDAY_PREFERENCES } from "@/lib/utils";

interface RecipientFormProps {
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    birthMonth: number;
    birthDay: number;
    street: string;
    city: string;
    state: string;
    zip: string;
    holidayPreference: string;
    notes: string | null;
  };
}

export default function RecipientForm({ recipient }: RecipientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: recipient?.firstName || "",
    lastName: recipient?.lastName || "",
    birthMonth: recipient?.birthMonth || 1,
    birthDay: recipient?.birthDay || 1,
    street: recipient?.street || "",
    city: recipient?.city || "",
    state: recipient?.state || "",
    zip: recipient?.zip || "",
    holidayPreference: recipient?.holidayPreference || "christmas",
    notes: recipient?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (recipient) {
        await updateRecipient(recipient.id, {
          ...form,
          birthMonth: Number(form.birthMonth),
          birthDay: Number(form.birthDay),
        });
      } else {
        await createRecipient({
          ...form,
          birthMonth: Number(form.birthMonth),
          birthDay: Number(form.birthDay),
        });
      }
      router.push("/recipients");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setLoading(false);
    }
  };

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString("default", { month: "long" }),
  }));

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>

          {/* Birthday */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Birth Month"
              value={form.birthMonth}
              onChange={(e) => update("birthMonth", e.target.value)}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
            <Select
              label="Birth Day"
              value={form.birthDay}
              onChange={(e) => update("birthDay", e.target.value)}
            >
              {days.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Address */}
          <Input
            label="Street Address"
            value={form.street}
            onChange={(e) => update("street", e.target.value)}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              required
            />
            <Select
              label="State"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              required
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
              value={form.zip}
              onChange={(e) => update("zip", e.target.value)}
              required
              maxLength={10}
            />
          </div>

          {/* Holiday Preference */}
          <Select
            label="Holiday Card Preference"
            value={form.holidayPreference}
            onChange={(e) => update("holidayPreference", e.target.value)}
          >
            {HOLIDAY_PREFERENCES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>

          {/* Notes */}
          <Textarea
            label="Notes (optional)"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="Any special notes about this recipient..."
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" loading={loading}>
              {recipient ? "Update Recipient" : "Add Recipient"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/recipients")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
