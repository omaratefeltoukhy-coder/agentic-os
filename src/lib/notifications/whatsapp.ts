// WhatsApp is the dominant channel in the Gulf. For now we generate wa.me
// deep links the UI can surface ("Message on WhatsApp", confirmations,
// referral shares). Swap in the Twilio WhatsApp API here later for
// automated sends without touching call sites.

export function waLink(phoneCountryCode: string | null, phoneNumber: string | null, message: string) {
  if (!phoneCountryCode || !phoneNumber) return null;
  const digits = `${phoneCountryCode}${phoneNumber}`.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
