"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { ArrowLeft, UserPlus, X } from "lucide-react";
import Link from "next/link";
import {
  updateOccasion,
  getOccasion,
  getRecipients,
  assignRecipientToOccasion,
  removeRecipientFromOccasion,
} from "@/lib/actions";

export default function EditOccasionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [occasion, setOccasion] = useState<any>(null);
  const [allRecipients, setAllRecipients] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [occ, recips] = await Promise.all([
      getOccasion(params.id),
      getRecipients(),
    ]);
    setOccasion(occ);
    setAllRecipients(recips);
    setMessage(occ?.message || "");
    setLoading(false);
  };

  const handleSaveMessage = async () => {
    setSaving(true);
    await updateOccasion(params.id, { message });
    setSaving(false);
  };

  const handleAssign = async (recipientId: string) => {
    await assignRecipientToOccasion(params.id, recipientId);
    await loadData();
  };

  const handleRemove = async (recipientId: string) => {
    await removeRecipientFromOccasion(params.id, recipientId);
    await loadData();
  };

  if (loading || !occasion) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  const assignedIds = new Set(
    occasion.occasionRecipients?.map((or: any) => or.recipientId) || []
  );
  const unassigned = allRecipients.filter(
    (r) => !assignedIds.has(r.id) && r.isActive
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/occasions"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Occasions
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{occasion.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={occasion.isBuiltIn ? "info" : "default"}>
            {occasion.isBuiltIn ? "Built-in" : "Custom"}
          </Badge>
          {occasion.date && (
            <span className="text-sm text-gray-500">
              Date: {occasion.date}
            </span>
          )}
        </div>
      </div>

      {/* Message Editor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Card Message</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mb-4"
          />
          <Button onClick={handleSaveMessage} loading={saving} size="sm">
            Save Message
          </Button>
        </CardContent>
      </Card>

      {/* Recipient Assignment (only for custom occasions) */}
      {!occasion.isBuiltIn && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Assigned Recipients (
              {occasion.occasionRecipients?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {occasion.occasionRecipients?.length > 0 && (
              <div className="mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Remove</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {occasion.occasionRecipients.map((or: any) => (
                      <TableRow key={or.id}>
                        <TableCell className="font-medium">
                          {or.recipient.firstName} {or.recipient.lastName}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(or.recipientId)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {unassigned.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Add Recipients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {unassigned.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleAssign(r.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-sm transition-colors border border-gray-200"
                    >
                      <UserPlus className="w-3 h-3" />
                      {r.firstName} {r.lastName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
