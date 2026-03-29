"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createOccasion } from "@/lib/actions";

export default function NewOccasionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    date: "",
    isRecurring: true,
    message: "",
  });

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let dateStr = form.date;
      if (form.isRecurring && form.date) {
        const d = new Date(form.date + "T00:00:00");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        dateStr = `${mm}-${dd}`;
      }

      await createOccasion({
        name: form.name,
        type: "custom",
        date: dateStr || null,
        isRecurring: form.isRecurring,
        message: form.message,
      });
      router.push("/occasions");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/occasions"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Occasions
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Add Custom Occasion
        </h1>
        <p className="text-gray-500 mt-1">
          Create a new occasion to send cards for
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Occasion Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g., Company Anniversary, Valentine's Day"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
              />
              <Select
                label="Frequency"
                value={form.isRecurring ? "recurring" : "one-time"}
                onChange={(e) =>
                  update("isRecurring", e.target.value === "recurring")
                }
              >
                <option value="recurring">Recurring (every year)</option>
                <option value="one-time">One-time</option>
              </Select>
            </div>

            <Textarea
              label="Card Message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              rows={4}
              placeholder="The message that will be printed on the card..."
              required
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading}>
                Create Occasion
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/occasions")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
