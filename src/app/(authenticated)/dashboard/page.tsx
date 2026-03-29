import { getDashboardData } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui/Card";
import { Users, Mail, CalendarHeart, Clock } from "lucide-react";
import { formatDate, formatMonthDay } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const stats = [
    {
      label: "Active Recipients",
      value: data.activeRecipients,
      total: data.totalRecipients,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
      href: "/recipients",
    },
    {
      label: "Cards Next 30 Days",
      value: data.upcomingCards,
      icon: Mail,
      color: "text-green-600 bg-green-50",
      href: "/cards",
    },
    {
      label: "Pending Cards",
      value: data.pendingCards,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
      href: "/cards",
    },
    {
      label: "Occasions",
      value: data.totalOccasions,
      icon: CalendarHeart,
      color: "text-purple-600 bg-purple-50",
      href: "/occasions",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of your automated card mailing system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/recipients/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="text-center py-6">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Add Recipient</p>
              <p className="text-sm text-gray-500">Add a new person to your list</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/recipients/import">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="text-center py-6">
              <Mail className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Import CSV</p>
              <p className="text-sm text-gray-500">Bulk import recipients</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/cards">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="text-center py-6">
              <CalendarHeart className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="font-medium text-gray-900">View Card Queue</p>
              <p className="text-sm text-gray-500">See upcoming cards to print</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Next Cards to Send</CardTitle>
          <Link href="/cards" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {data.nextCards.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              No upcoming cards. Add recipients to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {data.nextCards.map((card: any) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-700">
                        {card.recipient.firstName[0]}
                        {card.recipient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {card.recipient.firstName} {card.recipient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{card.occasion.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {formatDate(card.sendDate)}
                    </p>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
