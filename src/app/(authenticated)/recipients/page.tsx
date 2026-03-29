import { getRecipients } from "@/lib/actions";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Users, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { formatMonthDay } from "@/lib/utils";
import RecipientActions from "./RecipientActions";

export default async function RecipientsPage() {
  const recipients = await getRecipients();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
          <p className="text-gray-500 mt-1">
            Manage your card recipients ({recipients.length} total)
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/recipients/import">
            <Button variant="secondary">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </Link>
          <Link href="/recipients/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Recipient
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {recipients.length === 0 ? (
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="No recipients yet"
              description="Add your first recipient or import from a CSV file."
              action={
                <Link href="/recipients/new">
                  <Button>Add Recipient</Button>
                </Link>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Birthday</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Holiday Pref.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.firstName} {r.lastName}
                    </TableCell>
                    <TableCell>{formatMonthDay(r.birthMonth, r.birthDay)}</TableCell>
                    <TableCell className="text-sm">
                      {r.city}, {r.state} {r.zip}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.holidayPreference === "christmas" ? "danger" : "info"}>
                        {r.holidayPreference === "christmas" ? "Christmas" : "Happy Holidays"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.isActive ? "success" : "default"}>
                        {r.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RecipientActions id={r.id} isActive={r.isActive} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
