"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Card";
import { ArrowLeft, Upload, FileText, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { importRecipients } from "@/lib/actions";

interface ParsedRow {
  firstName: string;
  lastName: string;
  birthMonth: number;
  birthDay: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  holidayPreference: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows: ParsedRow[] = results.data.map((row: any) => {
            // Case-insensitive column lookup: find header that matches any of the candidate keys
            const get = (keys: string[]) => {
              const lowerKeys = keys.map((k) => k.toLowerCase());
              for (const header of Object.keys(row)) {
                if (lowerKeys.includes(header.toLowerCase().trim())) {
                  const val = row[header];
                  if (val != null && val !== "") return val.toString().trim();
                }
              }
              return "";
            };

            // Parse birthday from various formats
            let birthMonth = 1, birthDay = 1;
            const birthday = get(["birthday", "birth_date", "birthdate", "DOB", "date_of_birth", "birth date", "date of birth"]);
            if (birthday) {
              // Try MM/DD or MM-DD (2 parts)
              const slashParts = birthday.match(/^(\d{1,2})[\/\-](\d{1,2})$/);
              if (slashParts) {
                birthMonth = parseInt(slashParts[1]);
                birthDay = parseInt(slashParts[2]);
              } else {
                // Try MM/DD/YYYY or MM-DD-YYYY
                const fullSlash = birthday.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-]\d{2,4}$/);
                if (fullSlash) {
                  birthMonth = parseInt(fullSlash[1]);
                  birthDay = parseInt(fullSlash[2]);
                } else {
                  // Try YYYY-MM-DD (ISO format)
                  const iso = birthday.match(/^\d{4}-(\d{1,2})-(\d{1,2})/);
                  if (iso) {
                    birthMonth = parseInt(iso[1]);
                    birthDay = parseInt(iso[2]);
                  } else {
                    // Try parsing as a Date string (e.g., "March 15, 1990")
                    const parsed = new Date(birthday);
                    if (!isNaN(parsed.getTime())) {
                      birthMonth = parsed.getMonth() + 1;
                      birthDay = parsed.getDate();
                    }
                  }
                }
              }
            } else {
              // Try separate birthMonth / birthDay columns
              const m = get(["birthMonth", "birth_month"]);
              const d = get(["birthDay", "birth_day"]);
              if (m) birthMonth = parseInt(m);
              if (d) birthDay = parseInt(d);
            }

            return {
              firstName: get(["firstName", "first_name", "FirstName", "First Name", "first"]),
              lastName: get(["lastName", "last_name", "LastName", "Last Name", "last"]),
              birthMonth,
              birthDay,
              street: get(["street", "Street", "address", "Address", "street_address"]),
              city: get(["city", "City"]),
              state: get(["state", "State", "st"]),
              zip: get(["zip", "Zip", "ZIP", "zipcode", "zip_code", "ZipCode", "postal"]),
              holidayPreference: get(["holidayPreference", "holiday_preference", "holiday", "Holiday"]) || "christmas",
            };
          });

          const valid = rows.filter((r) => r.firstName && r.lastName);
          setParsed(valid);

          if (valid.length === 0) {
            setError("No valid rows found. Ensure your CSV has firstName/first_name and lastName/last_name columns.");
          }
        } catch (e: any) {
          setError("Failed to parse CSV: " + e.message);
        }
      },
      error: (err) => setError("Failed to read file: " + err.message),
    });
  }, []);

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await importRecipients(parsed);
      setResult(res);
      if (res.errors.length === 0) {
        setTimeout(() => router.push("/recipients"), 2000);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setImporting(false);
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/recipients"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recipients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Recipients</h1>
        <p className="text-gray-500 mt-1">
          Upload a CSV file to bulk-add recipients
        </p>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-700 font-medium">
                Choose a CSV file
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Expected columns: firstName, lastName, birthday (MM/DD), street, city, state, zip, holidayPreference
            </p>
            {fileName && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-700">
                <FileText className="w-4 h-4" />
                {fileName} ({parsed.length} rows)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Successfully imported {result.created} recipients!
          {result.errors.length > 0 && ` (${result.errors.length} errors)`}
        </div>
      )}

      {/* Preview Table */}
      {parsed.length > 0 && !result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Preview ({parsed.length} recipients)</CardTitle>
            <Button onClick={handleImport} loading={importing}>
              Import {parsed.length} Recipients
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Birthday</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Holiday</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.slice(0, 20).map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {r.firstName} {r.lastName}
                    </TableCell>
                    <TableCell>{r.birthMonth}/{r.birthDay}</TableCell>
                    <TableCell className="text-sm">
                      {r.street}, {r.city}, {r.state} {r.zip}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.holidayPreference === "christmas" ? "danger" : "info"}>
                        {r.holidayPreference === "christmas" ? "Christmas" : "Happy Holidays"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {parsed.length > 20 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 text-sm">
                      ...and {parsed.length - 20} more
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
