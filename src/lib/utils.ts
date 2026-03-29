import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatMonthDay(month: number, day: number): string {
  const date = new Date(2000, month - 1, day);
  return format(date, "MMMM d");
}

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  "DC",
];

export const CARD_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", color: "bg-blue-100 text-blue-800" },
  printed: { label: "Printed", color: "bg-green-100 text-green-800" },
  skipped: { label: "Skipped", color: "bg-gray-100 text-gray-800" },
};

export const HOLIDAY_PREFERENCES = [
  { value: "christmas", label: "Christmas" },
  { value: "happy_holidays", label: "Happy Holidays" },
];
