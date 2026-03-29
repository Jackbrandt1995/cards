"use client";

import { Button } from "@/components/ui/Button";
import { toggleRecipientActive, deleteRecipient } from "@/lib/actions";
import { Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RecipientActions({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await toggleRecipientActive(id);
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recipient? This will also delete all their cards.")) return;
    setLoading(true);
    await deleteRecipient(id);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/recipients/${id}`}>
        <Button variant="ghost" size="sm">
          <Pencil className="w-4 h-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" onClick={handleToggle} disabled={loading}>
        {isActive ? (
          <ToggleRight className="w-4 h-4 text-green-600" />
        ) : (
          <ToggleLeft className="w-4 h-4 text-gray-400" />
        )}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
}
