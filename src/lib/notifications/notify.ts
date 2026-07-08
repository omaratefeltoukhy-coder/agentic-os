import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/notifications/email";

type NotifyInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  emailHtml?: string;
  toEmail?: string;
};

export async function notify({ userId, type, title, body, emailHtml, toEmail }: NotifyInput) {
  await prisma.notification.create({
    data: { userId, type, title, body, channel: "IN_APP" },
  });

  if (toEmail) {
    await sendEmail({ to: toEmail, subject: title, html: emailHtml ?? `<p>${body}</p>` });
    await prisma.notification.create({
      data: { userId, type, title, body, channel: "EMAIL", sentAt: new Date() },
    });
  }
}
