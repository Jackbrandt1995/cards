"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { getOccasions, updateOccasion } from "@/lib/actions";
import {
  Save,
  Gift,
  TreePine,
  Star,
  Heart,
  CalendarHeart,
} from "lucide-react";

function getIcon(type: string) {
  switch (type) {
    case "birthday":
      return <Gift className="w-5 h-5 text-pink-500" />;
    case "christmas":
      return <TreePine className="w-5 h-5 text-green-600" />;
    case "happy_holidays":
      return <Star className="w-5 h-5 text-blue-500" />;
    case "thanksgiving":
      return <Heart className="w-5 h-5 text-orange-500" />;
    default:
      return <CalendarHeart className="w-5 h-5 text-purple-500" />;
  }
}

export default function TemplatesPage() {
  const [occasions, setOccasions] = useState<any[]>([]);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOccasions();
  }, []);

  const loadOccasions = async () => {
    const occs = await getOccasions();
    setOccasions(occs);
    const msgs: Record<string, string> = {};
    occs.forEach((o: any) => {
      msgs[o.id] = o.message;
    });
    setMessages(msgs);
    setLoading(false);
  };

  const handleSave = async (id: string) => {
    setSaving((prev) => ({ ...prev, [id]: true }));
    await updateOccasion(id, { message: messages[id] });
    setSaving((prev) => ({ ...prev, [id]: false }));
    setSaved((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [id]: false })), 2000);
  };

  if (loading)
    return (
      <div className="text-center py-12 text-gray-500">Loading...</div>
    );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Card Templates</h1>
        <p className="text-gray-500 mt-1">
          Edit the default messages for each occasion
        </p>
      </div>

      <div className="space-y-4">
        {occasions.map((occasion) => (
          <Card key={occasion.id}>
            <CardHeader className="flex flex-row items-center gap-3">
              {getIcon(occasion.type)}
              <div className="flex-1">
                <CardTitle className="text-base">{occasion.name}</CardTitle>
              </div>
              <Badge variant={occasion.isBuiltIn ? "info" : "default"}>
                {occasion.isBuiltIn ? "Built-in" : "Custom"}
              </Badge>
            </CardHeader>
            <CardContent>
              <Textarea
                value={messages[occasion.id] || ""}
                onChange={(e) =>
                  setMessages((prev) => ({
                    ...prev,
                    [occasion.id]: e.target.value,
                  }))
                }
                rows={3}
                className="mb-3"
              />
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() => handleSave(occasion.id)}
                  loading={saving[occasion.id]}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                {saved[occasion.id] && (
                  <span className="text-sm text-green-600">Saved!</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
