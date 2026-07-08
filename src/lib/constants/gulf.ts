export const GULF_CITIES = [
  "DUBAI",
  "ABU_DHABI",
  "RIYADH",
  "JEDDAH",
  "DOHA",
  "KUWAIT_CITY",
  "MANAMA",
  "MUSCAT",
] as const;

export type GulfCityCode = (typeof GULF_CITIES)[number];

export const CITY_INFO: Record<
  GulfCityCode,
  { label: string; labelAr: string; country: string; currency: CurrencyCode; weekend: string }
> = {
  DUBAI: { label: "Dubai", labelAr: "دبي", country: "UAE", currency: "AED", weekend: "Sat–Sun" },
  ABU_DHABI: {
    label: "Abu Dhabi",
    labelAr: "أبوظبي",
    country: "UAE",
    currency: "AED",
    weekend: "Sat–Sun",
  },
  RIYADH: {
    label: "Riyadh",
    labelAr: "الرياض",
    country: "Saudi Arabia",
    currency: "SAR",
    weekend: "Fri–Sat",
  },
  JEDDAH: {
    label: "Jeddah",
    labelAr: "جدة",
    country: "Saudi Arabia",
    currency: "SAR",
    weekend: "Fri–Sat",
  },
  DOHA: { label: "Doha", labelAr: "الدوحة", country: "Qatar", currency: "QAR", weekend: "Fri–Sat" },
  KUWAIT_CITY: {
    label: "Kuwait City",
    labelAr: "مدينة الكويت",
    country: "Kuwait",
    currency: "KWD",
    weekend: "Fri–Sat",
  },
  MANAMA: {
    label: "Manama",
    labelAr: "المنامة",
    country: "Bahrain",
    currency: "BHD",
    weekend: "Fri–Sat",
  },
  MUSCAT: {
    label: "Muscat",
    labelAr: "مسقط",
    country: "Oman",
    currency: "OMR",
    weekend: "Fri–Sat",
  },
};

export const CURRENCIES = ["AED", "SAR", "QAR", "KWD", "BHD", "OMR"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const CURRENCY_DECIMALS: Record<CurrencyCode, number> = {
  AED: 2,
  SAR: 2,
  QAR: 2,
  KWD: 3,
  BHD: 3,
  OMR: 3,
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  AED: "AED",
  SAR: "SAR",
  QAR: "QAR",
  KWD: "KWD",
  BHD: "BHD",
  OMR: "OMR",
};

export function formatMoney(amount: number, currency: CurrencyCode) {
  return `${amount.toFixed(CURRENCY_DECIMALS[currency])} ${CURRENCY_SYMBOLS[currency]}`;
}

export const GULF_PHONE_CODES = [
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
] as const;

export const SERVICE_TYPES = [
  "DOG_WALKING",
  "CAT_SITTING",
  "PET_BOARDING",
  "GROOMING",
  "PET_TAXI",
  "VET_VISIT",
] as const;

export const SERVICE_LABELS: Record<(typeof SERVICE_TYPES)[number], string> = {
  DOG_WALKING: "Dog Walking",
  CAT_SITTING: "Cat Sitting",
  PET_BOARDING: "Pet Boarding",
  GROOMING: "Grooming",
  PET_TAXI: "Pet Taxi",
  VET_VISIT: "Vet Visits",
};

export const LAUNCH_SERVICE_TYPES = ["DOG_WALKING", "CAT_SITTING"] as const;

export const LANGUAGES = ["ARABIC", "ENGLISH", "HINDI", "URDU", "TAGALOG", "FRENCH"] as const;

export const LANGUAGE_LABELS: Record<(typeof LANGUAGES)[number], string> = {
  ARABIC: "Arabic",
  ENGLISH: "English",
  HINDI: "Hindi",
  URDU: "Urdu",
  TAGALOG: "Tagalog",
  FRENCH: "French",
};

export const NEIGHBORHOODS: Record<GulfCityCode, string[]> = {
  DUBAI: [
    "Dubai Marina",
    "JLT",
    "Downtown Dubai",
    "Business Bay",
    "Al Barsha",
    "Jumeirah",
    "Deira",
    "Arabian Ranches",
    "Mirdif",
    "Al Nahda",
  ],
  ABU_DHABI: [
    "Al Reem Island",
    "Yas Island",
    "Corniche",
    "Al Khalidiya",
    "Al Raha Beach",
    "Saadiyat Island",
    "Al Mushrif",
    "Khalifa City",
  ],
  RIYADH: [
    "Al Olaya",
    "Al Malaz",
    "Al Nakheel",
    "King Fahd District",
    "Diplomatic Quarter",
    "Al Yasmin",
    "Al Sahafah",
    "Hittin",
  ],
  JEDDAH: ["Al Hamra", "Al Salamah", "Al Rawdah", "Al Zahra", "Al Shatea", "Obhur", "Al Naeem"],
  DOHA: ["West Bay", "The Pearl", "Al Sadd", "Al Waab", "Al Muntazah", "Al Dafna", "Msheireb"],
  KUWAIT_CITY: ["Salmiya", "Hawally", "Jabriya", "Mishref", "Shaab", "Salwa", "Bayan"],
  MANAMA: ["Juffair", "Seef", "Adliya", "Riffa", "Amwaj Islands", "Busaiteen"],
  MUSCAT: ["Al Khuwair", "Qurum", "Al Mouj", "Ruwi", "Shatti Al Qurum", "Bawshar"],
};

// Rough market hints only — shown as a helper on the caregiver rate step.
export const MARKET_RATE_RANGE: Record<GulfCityCode, { min: number; max: number }> = {
  DUBAI: { min: 40, max: 70 },
  ABU_DHABI: { min: 40, max: 65 },
  RIYADH: { min: 45, max: 75 },
  JEDDAH: { min: 40, max: 70 },
  DOHA: { min: 45, max: 75 },
  KUWAIT_CITY: { min: 4, max: 7 },
  MANAMA: { min: 4, max: 7 },
  MUSCAT: { min: 4, max: 7 },
};

export const OWNER_SERVICE_FEE: Record<CurrencyCode, number> = {
  AED: 5,
  SAR: 5,
  QAR: 5,
  KWD: 0.5,
  BHD: 0.5,
  OMR: 0.5,
};

// Sun=0 .. Sat=6, matching AvailabilitySlot.dayOfWeek.
export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const DAY_LABELS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

// UAE/Qatar/Bahrain/Kuwait/Oman commonly run Sat-Sun off in modern gulf
// workweeks except KSA/Qatar/Kuwait/Bahrain/Oman which run Fri-Sat. Used to
// pre-tick "day off" defaults during onboarding.
export const WEEKEND_DAYS: Record<GulfCityCode, number[]> = {
  DUBAI: [6, 0], // Sat, Sun
  ABU_DHABI: [6, 0],
  RIYADH: [5, 6], // Fri, Sat
  JEDDAH: [5, 6],
  DOHA: [5, 6],
  KUWAIT_CITY: [5, 6],
  MANAMA: [5, 6],
  MUSCAT: [5, 6],
};
