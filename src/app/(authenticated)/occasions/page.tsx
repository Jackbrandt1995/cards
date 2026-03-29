import { getOccasions } from "@/lib/actions";
import {
  Card,
  CardContent,
  Badge,
  EmptyState,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CalendarHeart,
  Plus,
  Gift,
  TreePine,
  Heart,
  Star,
} from "lucide-react";
import Link from "next/link";
import OccasionActions from "./OccasionActions";

function getOccasionIcon(type: string) {
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

function getOccasionBadge(type: string) {
  if (type === "birthday") return <Badge variant="warning">Birthday</Badge>;
  if (type === "christmas") return <Badge variant="danger">Christmas</Badge>;
  if (type === "happy_holidays")
    return <Badge variant="info">Happy Holidays</Badge>;
  if (type === "thanksgiving")
    return <Badge variant="warning">Thanksgiving</Badge>;
  return <Badge variant="default">Custom</Badge>;
}

export default async function OccasionsPage() {
  const occasions = await getOccasions();
  const builtIn = occasions.filter((o) => o.isBuiltIn);
  const custom = occasions.filter((o) => !o.isBuiltIn);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Occasions</h1>
          <p className="text-gray-500 mt-1">
            Manage holidays and events that trigger cards
          </p>
        </div>
        <Link href="/occasions/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Occasion
          </Button>
        </Link>
      </div>

      {/* Built-in Occasions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Built-in Occasions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {builtIn.map((occasion) => (
            <Card key={occasion.id}>
              <CardContent className="flex items-start gap-4 py-5">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                  {getOccasionIcon(occasion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {occasion.name}
                    </h3>
                    {getOccasionBadge(occasion.type)}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {occasion.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {occasion.type === "birthday"
                      ? "Sent to all active recipients on their birthday"
                      : occasion.type === "thanksgiving"
                        ? "Sent to all active recipients (4th Thursday of November)"
                        : "Sent based on each recipient's holiday preference"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Occasions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Custom Occasions
        </h2>
        {custom.length === 0 ? (
          <Card>
            <EmptyState
              icon={<CalendarHeart className="w-12 h-12" />}
              title="No custom occasions"
              description="Create custom occasions for special events, anniversaries, or any other dates."
              action={
                <Link href="/occasions/new">
                  <Button>Add Custom Occasion</Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {custom.map((occasion) => (
              <Card key={occasion.id}>
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <CalendarHeart className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {occasion.name}
                        </h3>
                        <Badge variant="default">Custom</Badge>
                      </div>
                      <OccasionActions id={occasion.id} />
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {occasion.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {occasion.date && <span>Date: {occasion.date}</span>}
                      <span>
                        {occasion.isRecurring ? "Recurring" : "One-time"}
                      </span>
                      <span>
                        {(occasion as any)._count?.occasionRecipients || 0}{" "}
                        recipients
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
