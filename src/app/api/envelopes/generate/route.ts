import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateEnvelopePDF } from "@/lib/pdf";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) {
    return NextResponse.json({ error: "No card IDs provided" }, { status: 400 });
  }

  const cardIds = ids.split(",").filter(Boolean);

  const cards = await prisma.card.findMany({
    where: { id: { in: cardIds } },
    include: { recipient: true },
    orderBy: { sendDate: "asc" },
  });

  if (cards.length === 0) {
    return NextResponse.json({ error: "No cards found" }, { status: 404 });
  }

  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  // Deduplicate by recipient (no need for multiple envelopes to the same person)
  const seen = new Set<string>();
  const uniqueCards = cards.filter((card) => {
    if (seen.has(card.recipientId)) return false;
    seen.add(card.recipientId);
    return true;
  });

  const envelopeData = uniqueCards.map((card) => ({
    recipientName: `${card.recipient.firstName} ${card.recipient.lastName}`,
    recipientStreet: card.recipient.street,
    recipientCity: card.recipient.city,
    recipientState: card.recipient.state,
    recipientZip: card.recipient.zip,
    returnName: settings?.businessName || "",
    returnStreet: settings?.returnStreet || "",
    returnCity: settings?.returnCity || "",
    returnState: settings?.returnState || "",
    returnZip: settings?.returnZip || "",
  }));

  const doc = generateEnvelopePDF(envelopeData);
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="envelopes-${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}
