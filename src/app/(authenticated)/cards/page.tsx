import { getUpcomingCards } from "@/lib/actions";
import CardQueueClient from "./CardQueueClient";

export default async function CardsPage() {
  const cards = await getUpcomingCards(90);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Card Queue</h1>
        <p className="text-gray-500 mt-1">
          Upcoming cards to print and mail ({cards.length} cards in next 90
          days)
        </p>
      </div>

      <CardQueueClient initialCards={cards} />
    </div>
  );
}
