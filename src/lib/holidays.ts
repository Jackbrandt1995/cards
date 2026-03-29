import { addDays, getDay } from "date-fns";

/**
 * Calculate Thanksgiving date (4th Thursday of November) for a given year
 */
export function getThanksgivingDate(year: number): Date {
  // Start at November 1
  let date = new Date(year, 10, 1); // month is 0-indexed, so 10 = November
  // Find first Thursday
  const dayOfWeek = getDay(date);
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
  date = addDays(date, daysUntilThursday);
  // Add 3 weeks to get 4th Thursday
  date = addDays(date, 21);
  return date;
}

/**
 * Get the next occurrence of a birthday given month/day
 */
export function getNextBirthday(
  birthMonth: number,
  birthDay: number,
  referenceDate: Date = new Date()
): Date {
  const currentYear = referenceDate.getFullYear();
  let birthday = new Date(currentYear, birthMonth - 1, birthDay);

  // If birthday already passed this year, use next year
  if (birthday < referenceDate) {
    birthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
  }

  return birthday;
}

/**
 * Get the Christmas date for a given year
 */
export function getChristmasDate(year: number): Date {
  return new Date(year, 11, 25); // December 25
}

/**
 * Get the next occurrence of a recurring date (MM-DD format)
 */
export function getNextOccurrence(
  dateStr: string,
  referenceDate: Date = new Date()
): Date {
  const [month, day] = dateStr.split("-").map(Number);
  const currentYear = referenceDate.getFullYear();
  let date = new Date(currentYear, month - 1, day);

  if (date < referenceDate) {
    date = new Date(currentYear + 1, month - 1, day);
  }

  return date;
}

/**
 * Calculate the send date based on occasion date and lead time
 */
export function calculateSendDate(occasionDate: Date, leadTimeDays: number): Date {
  return addDays(occasionDate, -leadTimeDays);
}

/**
 * Get all upcoming occasion dates for a year
 */
export function getOccasionDatesForYear(year: number) {
  return {
    thanksgiving: getThanksgivingDate(year),
    christmas: getChristmasDate(year),
  };
}
