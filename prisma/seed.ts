import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@cardflow.com" },
    update: {},
    create: {
      email: "admin@cardflow.com",
      name: "Admin",
      passwordHash,
      role: "admin",
    },
  });

  // Create built-in occasions
  const builtInOccasions = [
    {
      id: "birthday",
      name: "Birthday",
      type: "birthday",
      date: null,
      isRecurring: true,
      isBuiltIn: true,
      message: "Wishing you a wonderful birthday filled with joy and happiness!",
    },
    {
      id: "christmas",
      name: "Christmas",
      type: "christmas",
      date: "12-25",
      isRecurring: true,
      isBuiltIn: true,
      message: "Merry Christmas and Happy New Year! Wishing you warmth and cheer this holiday season.",
    },
    {
      id: "happy-holidays",
      name: "Happy Holidays",
      type: "happy_holidays",
      date: "12-25",
      isRecurring: true,
      isBuiltIn: true,
      message: "Wishing you a joyful holiday season and a wonderful New Year!",
    },
    {
      id: "thanksgiving",
      name: "Thanksgiving",
      type: "thanksgiving",
      date: null,
      isRecurring: true,
      isBuiltIn: true,
      message: "Happy Thanksgiving! We are grateful for you and wish you a season of blessings.",
    },
  ];

  for (const occasion of builtInOccasions) {
    await prisma.occasion.upsert({
      where: { id: occasion.id },
      update: { message: occasion.message },
      create: occasion,
    });
  }

  // Create default settings
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      businessName: "",
      returnStreet: "",
      returnCity: "",
      returnState: "",
      returnZip: "",
      leadTimeDays: 14,
      cardSize: "5x7",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("   Admin login: admin@cardflow.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
