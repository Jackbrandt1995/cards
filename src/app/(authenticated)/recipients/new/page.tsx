import RecipientForm from "@/components/recipients/RecipientForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRecipientPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/recipients"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recipients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Recipient</h1>
        <p className="text-gray-500 mt-1">
          Add a new person to receive cards
        </p>
      </div>
      <RecipientForm />
    </div>
  );
}
