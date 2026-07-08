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
