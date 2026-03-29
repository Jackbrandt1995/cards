"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  EmptyState,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import {
  Mail,
  Check,
  X,
  Printer,
  FileText,
  CheckSquare,
  Square,
  Pencil,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  updateCardStatus,
  updateCardMessage,
  bulkUpdateCardStatus,
} from "@/lib/actions";

interface CardData {
  id: string;
  message: string;
  sendDate: string | Date;
  status: string;
  year: number;
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  occasion: {
    id: string;
    name: string;
    type: string;
  };
}

const statusConfig: Record<
  string,
  { label: string; variant: "warning" | "info" | "success" | "default" }
> = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "info" },
  printed: { label: "Printed", variant: "success" },
  skipped: { label: "Skipped", variant: "default" },
};

export default function CardQueueClient({
  initialCards,
}: {
  initialCards: CardData[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filteredCards =
    filter === "all"
      ? initialCards
      : initialCards.filter((c) => c.status === filter);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredCards.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredCards.map((c) => c.id)));
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateCardStatus(id, status);
    router.refresh();
  };

  const handleBulkStatus = async (status: string) => {
    if (selected.size === 0) return;
    await bulkUpdateCardStatus(Array.from(selected), status);
    setSelected(new Set());
    router.refresh();
  };

  const handleSaveMessage = async () => {
    if (!editingCard) return;
    await updateCardMessage(editingCard.id, editMessage);
    setEditingCard(null);
    router.refresh();
  };

  const handleGeneratePDF = () => {
    const ids =
      selected.size > 0 ? Array.from(selected) : filteredCards.map((c) => c.id);
    window.open(
      `/api/cards/generate?ids=${ids.join(",")}`,
      "_blank"
    );
  };

  const handleGenerateEnvelopes = () => {
    const ids =
      selected.size > 0 ? Array.from(selected) : filteredCards.map((c) => c.id);
    window.open(
      `/api/envelopes/generate?ids=${ids.join(",")}`,
      "_blank"
    );
  };

  return (
    <>
      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-3 py-3">
          {/* Filters */}
          <div className="flex items-center gap-1 mr-4">
            {["all", "pending", "approved", "printed", "skipped"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === f
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f === "all" ? "All" : statusConfig[f]?.label || f}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Bulk Actions */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selected.size} selected
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBulkStatus("approved")}
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleBulkStatus("printed")}
              >
                <Printer className="w-4 h-4 mr-1" />
                Mark Printed
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleBulkStatus("skipped")}
              >
                <X className="w-4 h-4 mr-1" />
                Skip
              </Button>
            </div>
          )}

          {/* PDF Buttons */}
          <Button size="sm" onClick={handleGeneratePDF}>
            <FileText className="w-4 h-4 mr-1" />
            Download Cards PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={handleGenerateEnvelopes}>
            <Mail className="w-4 h-4 mr-1" />
            Download Envelopes
          </Button>
        </CardContent>
      </Card>

      {/* Cards Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCards.length === 0 ? (
            <EmptyState
              icon={<Mail className="w-12 h-12" />}
              title="No cards in queue"
              description={
                filter === "all"
                  ? "Add recipients to start generating cards automatically."
                  : `No cards with status "${filter}".`
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <button onClick={toggleAll}>
                      {selected.size === filteredCards.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Occasion</TableHead>
                  <TableHead>Send Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCards.map((card) => {
                  const sc = statusConfig[card.status] || statusConfig.pending;
                  return (
                    <TableRow key={card.id}>
                      <TableCell>
                        <button onClick={() => toggleSelect(card.id)}>
                          {selected.has(card.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {card.recipient.firstName}{" "}
                            {card.recipient.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {card.recipient.city}, {card.recipient.state}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{card.occasion.name}</TableCell>
                      <TableCell>{formatDate(card.sendDate)}</TableCell>
                      <TableCell>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCard(card);
                              setEditMessage(card.message);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {card.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(card.id, "approved")
                                }
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(card.id, "skipped")
                                }
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Message Modal */}
      <Modal
        open={!!editingCard}
        onClose={() => setEditingCard(null)}
        title="Edit Card Message"
      >
        <Textarea
          value={editMessage}
          onChange={(e) => setEditMessage(e.target.value)}
          rows={5}
          className="mb-4"
        />
        <div className="flex gap-3">
          <Button onClick={handleSaveMessage}>Save Message</Button>
          <Button variant="secondary" onClick={() => setEditingCard(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
}
