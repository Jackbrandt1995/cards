import { prisma } from "./db";
import {
  getThanksgivingDate,
  getChristmasDate,
  calculateSendDate,
} from "./holidays";
import { addDays } from "date-fns";

interface QueuedCard {
  recipientId: string;
  recipientName: string;
  occasionId: string;
  occasionName: string;
  occasionType: string;
  message: string;
  occasionDate: Date;
  sendDate: Date;
  year: number;
}

/**
 * Generate cards for all active recipients for upcoming occasions
 * within a given number of days from now
 */
export async function generateUpcomingCards(daysAhead: number = 90) {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const leadTimeDays = settings?.leadTimeDays ?? 14;
  const now = new Date();
  const cutoffDate = addDays(now, daysAhead);
  const currentYear = now.getFullYear();
  const years = [currentYear, currentYear + 1];

  const recipients = await prisma.recipient.findMany({
    where: { isActive: true },
    include: { occasionRecipients: { include: { occasion: true } } },
  });

  const occasions = await prisma.occasion.findMany();
  const birthdayOccasion = occasions.find((o) => o.type === "birthday");
  const christmasOccasion = occasions.find((o) => o.type === "christmas");
  const happyHolidaysOccasion = occasions.find((o) => o.type === "happy_holidays");
  const thanksgivingOccasion = occasions.find((o) => o.type === "thanksgiving");
  const customOccasions = occasions.filter((o) => !o.isBuiltIn);

  const cardsToCreate: QueuedCard[] = [];

  for (const recipient of recipients) {
    for (const year of years) {
      // Birthday
      if (birthdayOccasion) {
        const birthdayDate = new Date(year, recipient.birthMonth - 1, recipient.birthDay);
        const sendDate = calculateSendDate(birthdayDate, leadTimeDays);
        if (sendDate >= now && birthdayDate <= cutoffDate) {
          cardsToCreate.push({
            recipientId: recipient.id,
            recipientName: `${recipient.firstName} ${recipient.lastName}`,
            occasionId: birthdayOccasion.id,
            occasionName: "Birthday",
            occasionType: "birthday",
            message: birthdayOccasion.message,
            occasionDate: birthdayDate,
            sendDate,
            year,
          });
        }
      }

      // Christmas or Happy Holidays (per recipient preference)
      const holidayOccasion =
        recipient.holidayPreference === "christmas"
          ? christmasOccasion
          : happyHolidaysOccasion;
      if (holidayOccasion) {
        const christmasDate = getChristmasDate(year);
        const sendDate = calculateSendDate(christmasDate, leadTimeDays);
        if (sendDate >= now && christmasDate <= cutoffDate) {
          cardsToCreate.push({
            recipientId: recipient.id,
            recipientName: `${recipient.firstName} ${recipient.lastName}`,
            occasionId: holidayOccasion.id,
            occasionName: holidayOccasion.name,
            occasionType: holidayOccasion.type,
            message: holidayOccasion.message,
            occasionDate: christmasDate,
            sendDate,
            year,
          });
        }
      }

      // Thanksgiving
      if (thanksgivingOccasion) {
        const thanksgivingDate = getThanksgivingDate(year);
        const sendDate = calculateSendDate(thanksgivingDate, leadTimeDays);
        if (sendDate >= now && thanksgivingDate <= cutoffDate) {
          cardsToCreate.push({
            recipientId: recipient.id,
            recipientName: `${recipient.firstName} ${recipient.lastName}`,
            occasionId: thanksgivingOccasion.id,
            occasionName: "Thanksgiving",
            occasionType: "thanksgiving",
            message: thanksgivingOccasion.message,
            occasionDate: thanksgivingDate,
            sendDate,
            year,
          });
        }
      }

      // Custom occasions (only for assigned recipients)
      for (const customOccasion of customOccasions) {
        const isAssigned = recipient.occasionRecipients.some(
          (or) => or.occasionId === customOccasion.id
        );
        if (!isAssigned) continue;

        if (customOccasion.date) {
          let occasionDate: Date;
          if (customOccasion.isRecurring) {
            const [month, day] = customOccasion.date.split("-").map(Number);
            occasionDate = new Date(year, month - 1, day);
          } else {
            occasionDate = new Date(customOccasion.date);
          }
          const sendDate = calculateSendDate(occasionDate, leadTimeDays);
          if (sendDate >= now && occasionDate <= cutoffDate) {
            cardsToCreate.push({
              recipientId: recipient.id,
              recipientName: `${recipient.firstName} ${recipient.lastName}`,
              occasionId: customOccasion.id,
              occasionName: customOccasion.name,
              occasionType: "custom",
              message: customOccasion.message,
              occasionDate,
              sendDate,
              year,
            });
          }
        }
      }
    }
  }

  // Create cards in DB (skip if already exists)
  let created = 0;
  for (const card of cardsToCreate) {
    try {
      await prisma.card.upsert({
        where: {
          recipientId_occasionId_year: {
            recipientId: card.recipientId,
            occasionId: card.occasionId,
            year: card.year,
          },
        },
        update: {},
        create: {
          recipientId: card.recipientId,
          occasionId: card.occasionId,
          message: card.message,
          sendDate: card.sendDate,
          status: "pending",
          year: card.year,
        },
      });
      created++;
    } catch (_e) {
      // Skip duplicates
    }
  }

  return { total: cardsToCreate.length, created };
}
