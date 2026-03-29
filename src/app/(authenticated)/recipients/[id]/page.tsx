import { getRecipient } from "@/lib/actions";
import { notFound } from "next/navigation";
import RecipientForm from "@/components/recipients/RecipientForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditRecipientPage({
  params,
}: {
  params: { id: string };
}) {
  const recipient = await getRecipient(params.id);
  if (!recipient) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/recipients"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recipients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit {recipient.firstName} {recipient.lastName}
        </h1>
      </div>
      <RecipientForm recipient={recipient} />
    </div>
  );
}
