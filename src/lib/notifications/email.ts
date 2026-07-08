// Thin wrapper so the rest of the app never talks to a specific provider
// directly. Resend today; swap the implementation to add SendGrid, or wire
// Twilio WhatsApp alongside it, without touching call sites.

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "GulfPaws <noreply@gulfpaws.app>";

  if (!apiKey) {
    // No provider configured (local/dev) — log so the flow is still testable.
    console.log(`[email:dev] to=${to} subject="${subject}"\n${html}`);
    return { delivered: false, dev: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend send failed: ${res.status} ${body}`);
  }

  return { delivered: true, dev: false };
}

export function otpEmailHtml(code: string, purpose: "EMAIL_VERIFY" | "PASSWORD_RESET") {
  const heading =
    purpose === "EMAIL_VERIFY" ? "Verify your email" : "Reset your GulfPaws password";
  return `
    <div style="font-family:sans-serif;background:#0e1b24;color:#ede8df;padding:32px">
      <h1 style="color:#e8a94b;font-size:20px">${heading}</h1>
      <p>Your code is:</p>
      <p style="font-size:32px;letter-spacing:8px;font-weight:700">${code}</p>
      <p style="color:#b9b3a6;font-size:13px">This code expires in 10 minutes.</p>
    </div>
  `;
}
