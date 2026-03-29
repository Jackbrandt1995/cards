"use server";

import { prisma } from "./db";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { revalidatePath } from "next/cache";
import { generateUpcomingCards } from "./queue";

async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

// ====== RECIPIENTS ======

export async function getRecipients() {
  await requireAuth();
  return prisma.recipient.findMany({
    orderBy: { lastName: "asc" },
  });
}

export async function getRecipient(id: string) {
  await requireAuth();
  return prisma.recipient.findUnique({
    where: { id },
    include: { occasionRecipients: { include: { occasion: true } } },
  });
}

export async function createRecipient(data: {
  firstName: string;
  lastName: string;
  birthMonth: number;
  birthDay: number;
  street: string;
  city: string;
  state: string;
  zip: string;
  holidayPreference: string;
  notes?: string;
}) {
  await requireAuth();
  const recipient = await prisma.recipient.create({ data });
  revalidatePath("/recipients");
  revalidatePath("/dashboard");
  return recipient;
}

export async function updateRecipient(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    birthMonth?: number;
    birthDay?: number;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    holidayPreference?: string;
    isActive?: boolean;
    notes?: string;
  }
) {
  await requireAuth();
  const recipient = await prisma.recipient.update({ where: { id }, data });
  revalidatePath("/recipients");
  revalidatePath("/dashboard");
  return recipient;
}

export async function deleteRecipient(id: string) {
  await requireAuth();
  await prisma.recipient.delete({ where: { id } });
  revalidatePath("/recipients");
  revalidatePath("/dashboard");
}

export async function toggleRecipientActive(id: string) {
  await requireAuth();
  const recipient = await prisma.recipient.findUnique({ where: { id } });
  if (!recipient) throw new Error("Recipient not found");
  await prisma.recipient.update({
    where: { id },
    data: { isActive: !recipient.isActive },
  });
  revalidatePath("/recipients");
}

export async function importRecipients(
  recipients: Array<{
    firstName: string;
    lastName: string;
    birthMonth: number;
    birthDay: number;
    street: string;
    city: string;
    state: string;
    zip: string;
    holidayPreference?: string;
  }>
) {
  await requireAuth();
  let created = 0;
  const errors: string[] = [];

  for (const r of recipients) {
    try {
      await prisma.recipient.create({
        data: {
          firstName: r.firstName.trim(),
          lastName: r.lastName.trim(),
          birthMonth: r.birthMonth,
          birthDay: r.birthDay,
          street: r.street.trim(),
          city: r.city.trim(),
          state: r.state.trim().toUpperCase(),
          zip: r.zip.trim(),
          holidayPreference: r.holidayPreference || "christmas",
        },
      });
      created++;
    } catch (e: any) {
      errors.push(`${r.firstName} ${r.lastName}: ${e.message}`);
    }
  }

  revalidatePath("/recipients");
  revalidatePath("/dashboard");
  return { created, errors };
}

// ====== OCCASIONS ======

export async function getOccasions() {
  await requireAuth();
  return prisma.occasion.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { occasionRecipients: true } } },
  });
}

export async function getOccasion(id: string) {
  await requireAuth();
  return prisma.occasion.findUnique({
    where: { id },
    include: {
      occasionRecipients: { include: { recipient: true } },
    },
  });
}

export async function createOccasion(data: {
  name: string;
  type: string;
  date: string | null;
  isRecurring: boolean;
  message: string;
}) {
  await requireAuth();
  const occasion = await prisma.occasion.create({
    data: {
      ...data,
      isBuiltIn: false,
    },
  });
  revalidatePath("/occasions");
  return occasion;
}

export async function updateOccasion(
  id: string,
  data: {
    name?: string;
    date?: string | null;
    isRecurring?: boolean;
    message?: string;
  }
) {
  await requireAuth();
  const occasion = await prisma.occasion.update({ where: { id }, data });
  revalidatePath("/occasions");
  revalidatePath("/templates");
  return occasion;
}

export async function deleteOccasion(id: string) {
  await requireAuth();
  const occasion = await prisma.occasion.findUnique({ where: { id } });
  if (occasion?.isBuiltIn) throw new Error("Cannot delete built-in occasions");
  await prisma.occasion.delete({ where: { id } });
  revalidatePath("/occasions");
}

export async function assignRecipientToOccasion(
  occasionId: string,
  recipientId: string
) {
  await requireAuth();
  await prisma.occasionRecipient.create({
    data: { occasionId, recipientId },
  });
  revalidatePath("/occasions");
}

export async function removeRecipientFromOccasion(
  occasionId: string,
  recipientId: string
) {
  await requireAuth();
  await prisma.occasionRecipient.deleteMany({
    where: { occasionId, recipientId },
  });
  revalidatePath("/occasions");
}

// ====== CARDS ======

export async function getUpcomingCards(daysAhead: number = 90) {
  await requireAuth();
  // Generate any missing cards first
  await generateUpcomingCards(daysAhead);

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return prisma.card.findMany({
    where: {
      sendDate: { gte: now, lte: cutoff },
    },
    include: {
      recipient: true,
      occasion: true,
    },
    orderBy: { sendDate: "asc" },
  });
}

export async function updateCardStatus(id: string, status: string) {
  await requireAuth();
  await prisma.card.update({ where: { id }, data: { status } });
  revalidatePath("/cards");
  revalidatePath("/dashboard");
}

export async function updateCardMessage(id: string, message: string) {
  await requireAuth();
  await prisma.card.update({ where: { id }, data: { message } });
  revalidatePath("/cards");
}

export async function getCardsForPrint(cardIds: string[]) {
  await requireAuth();
  return prisma.card.findMany({
    where: { id: { in: cardIds } },
    include: { recipient: true, occasion: true },
    orderBy: { sendDate: "asc" },
  });
}

export async function bulkUpdateCardStatus(cardIds: string[], status: string) {
  await requireAuth();
  await prisma.card.updateMany({
    where: { id: { in: cardIds } },
    data: { status },
  });
  revalidatePath("/cards");
  revalidatePath("/dashboard");
}

// ====== SETTINGS ======

export async function getSettings() {
  await requireAuth();
  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: "default" },
    });
  }
  return settings;
}

export async function updateSettings(data: {
  businessName?: string;
  returnStreet?: string;
  returnCity?: string;
  returnState?: string;
  returnZip?: string;
  leadTimeDays?: number;
  cardSize?: string;
}) {
  await requireAuth();
  const settings = await prisma.settings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });
  revalidatePath("/settings");
  return settings;
}

// ====== DASHBOARD ======

export async function getDashboardData() {
  await requireAuth();
  const now = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const [
    totalRecipients,
    activeRecipients,
    upcomingCards,
    pendingCards,
    totalOccasions,
  ] = await Promise.all([
    prisma.recipient.count(),
    prisma.recipient.count({ where: { isActive: true } }),
    prisma.card.count({
      where: { sendDate: { gte: now, lte: thirtyDays } },
    }),
    prisma.card.count({
      where: { status: "pending", sendDate: { gte: now } },
    }),
    prisma.occasion.count(),
  ]);

  const nextCards = await prisma.card.findMany({
    where: { sendDate: { gte: now }, status: "pending" },
    include: { recipient: true, occasion: true },
    orderBy: { sendDate: "asc" },
    take: 5,
  });

  return {
    totalRecipients,
    activeRecipients,
    upcomingCards,
    pendingCards,
    totalOccasions,
    nextCards,
  };
}
