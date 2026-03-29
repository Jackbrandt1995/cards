"use client";

import { Button } from "@/components/ui/Button";
import { deleteOccasion } from "@/lib/actions";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OccasionActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this custom occasion? All associated cards will also be deleted."
      )
    )
      return;
    setLoading(true);
    await deleteOccasion(id);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Link href={`/occasions/${id}`}>
        <Button variant="ghost" size="sm">
          <Pencil className="w-4 h-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </div>
  );
}
