import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorizeConversation(userId: string, bookingId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { bookingId } });
  if (!conversation) return null;
  if (conversation.ownerId !== userId && conversation.caregiverId !== userId) return null;
  return conversation;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const conversation = await authorizeConversation(session.user.id, id);
  if (!conversation) return NextResponse.json({ messages: [] });

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

const schema = z.object({ body: z.string().trim().min(1).max(1000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const conversation = await authorizeConversation(session.user.id, id);
  if (!conversation) {
    return NextResponse.json({ error: "No conversation for this booking yet." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });

  const message = await prisma.message.create({
    data: { conversationId: conversation.id, senderId: session.user.id, body: parsed.data.body },
    include: { sender: { select: { name: true } } },
  });

  return NextResponse.json({ message });
}
