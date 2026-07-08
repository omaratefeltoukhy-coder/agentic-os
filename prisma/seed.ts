import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Demo1234";

async function hashed() {
  return bcrypt.hash(DEMO_PASSWORD, 12);
}

const COOL_HOUR_SLOTS = [330, 360, 390, 420, 1110, 1140, 1170, 1200, 1230, 1260];
function fullDaySlots() {
  const slots: number[] = [];
  for (let m = 330; m <= 1260; m += 30) slots.push(m);
  return slots;
}

type CaregiverSeed = {
  name: string;
  email: string;
  city: "DUBAI" | "ABU_DHABI" | "RIYADH" | "JEDDAH" | "DOHA" | "KUWAIT_CITY" | "MANAMA" | "MUSCAT";
  currency: "AED" | "SAR" | "QAR" | "KWD" | "BHD" | "OMR";
  areas: string[];
  services: ("DOG_WALKING" | "CAT_SITTING")[];
  hourlyRate: number;
  languages: ("ARABIC" | "ENGLISH" | "HINDI" | "URDU" | "TAGALOG" | "FRENCH")[];
  bio: string;
  yearsExperience: number;
  verificationStatus: "APPROVED" | "UNVERIFIED" | "PENDING";
  ratingAverage: number | null;
  ratingCount: number;
  isProBadge: boolean;
  isFeatured: boolean;
  fullAvailability: boolean;
};

const CAREGIVERS: CaregiverSeed[] = [
  {
    name: "Maria Santos",
    email: "maria.santos@demo.gulfpaws.app",
    city: "DUBAI",
    currency: "AED",
    areas: ["Dubai Marina", "JLT", "Al Barsha"],
    services: ["DOG_WALKING", "CAT_SITTING"],
    hourlyRate: 55,
    languages: ["ENGLISH", "TAGALOG"],
    bio: "Animal lover with 6 years of experience walking dogs across Dubai Marina. Certified in pet first aid.",
    yearsExperience: 6,
    verificationStatus: "APPROVED",
    ratingAverage: 4.8,
    ratingCount: 34,
    isProBadge: true,
    isFeatured: true,
    fullAvailability: true,
  },
  {
    name: "Ahmed Al Farsi",
    email: "ahmed.alfarsi@demo.gulfpaws.app",
    city: "DUBAI",
    currency: "AED",
    areas: ["Downtown Dubai", "Business Bay"],
    services: ["DOG_WALKING"],
    hourlyRate: 48,
    languages: ["ARABIC", "ENGLISH"],
    bio: "Former vet assistant, now walking dogs full time. Great with large and reactive breeds.",
    yearsExperience: 4,
    verificationStatus: "APPROVED",
    ratingAverage: 4.5,
    ratingCount: 18,
    isProBadge: false,
    isFeatured: false,
    fullAvailability: true,
  },
  {
    name: "Carlos Mendoza",
    email: "carlos.mendoza@demo.gulfpaws.app",
    city: "DUBAI",
    currency: "AED",
    areas: ["Jumeirah", "Al Nahda"],
    services: ["DOG_WALKING", "CAT_SITTING"],
    hourlyRate: 42,
    languages: ["ENGLISH"],
    bio: "New to GulfPaws but not new to pets — I've cared for my own dogs and cats for over a decade.",
    yearsExperience: 2,
    verificationStatus: "UNVERIFIED",
    ratingAverage: null,
    ratingCount: 0,
    isProBadge: false,
    isFeatured: false,
    fullAvailability: true,
  },
  {
    name: "Priya Nair",
    email: "priya.nair@demo.gulfpaws.app",
    city: "ABU_DHABI",
    currency: "AED",
    areas: ["Al Reem Island", "Yas Island", "Saadiyat Island"],
    services: ["CAT_SITTING", "DOG_WALKING"],
    hourlyRate: 50,
    languages: ["ENGLISH", "HINDI"],
    bio: "Cat behaviorist and lifelong pet sitter. I send photo updates every visit — your pets are family.",
    yearsExperience: 7,
    verificationStatus: "APPROVED",
    ratingAverage: 4.9,
    ratingCount: 41,
    isProBadge: true,
    isFeatured: false,
    fullAvailability: true,
  },
  {
    name: "Khalid Al Mansoori",
    email: "khalid.almansoori@demo.gulfpaws.app",
    city: "ABU_DHABI",
    currency: "AED",
    areas: ["Khalifa City", "Al Mushrif"],
    services: ["DOG_WALKING"],
    hourlyRate: 45,
    languages: ["ARABIC", "ENGLISH"],
    bio: "Early riser — I specialize in cool-hour morning walks before the heat sets in.",
    yearsExperience: 3,
    verificationStatus: "APPROVED",
    ratingAverage: 4.6,
    ratingCount: 9,
    isProBadge: false,
    isFeatured: false,
    fullAvailability: false,
  },
  {
    name: "Fahad Al Otaibi",
    email: "fahad.alotaibi@demo.gulfpaws.app",
    city: "RIYADH",
    currency: "SAR",
    areas: ["Al Olaya", "Diplomatic Quarter"],
    services: ["DOG_WALKING"],
    hourlyRate: 60,
    languages: ["ARABIC", "ENGLISH"],
    bio: "Trained in canine handling, comfortable with all breeds and sizes.",
    yearsExperience: 5,
    verificationStatus: "APPROVED",
    ratingAverage: 4.6,
    ratingCount: 12,
    isProBadge: false,
    isFeatured: false,
    fullAvailability: true,
  },
  {
    name: "Layla Hassan",
    email: "layla.hassan@demo.gulfpaws.app",
    city: "JEDDAH",
    currency: "SAR",
    areas: ["Al Hamra", "Al Salamah"],
    services: ["CAT_SITTING"],
    hourlyRate: 45,
    languages: ["ARABIC", "ENGLISH", "FRENCH"],
    bio: "Just joined GulfPaws! I've raised cats my whole life and would love to look after yours.",
    yearsExperience: 1,
    verificationStatus: "UNVERIFIED",
    ratingAverage: null,
    ratingCount: 0,
    isProBadge: false,
    isFeatured: false,
    fullAvailability: true,
  },
  {
    name: "Rashid Al Kuwari",
    email: "rashid.alkuwari@demo.gulfpaws.app",
    city: "DOHA",
    currency: "QAR",
    areas: ["West Bay", "The Pearl"],
    services: ["DOG_WALKING", "CAT_SITTING"],
    hourlyRate: 65,
    languages: ["ARABIC", "ENGLISH", "URDU"],
    bio: "Full-service pet care — walks, sits, and everything in between. Background-checked and insured.",
    yearsExperience: 8,
    verificationStatus: "APPROVED",
    ratingAverage: 4.7,
    ratingCount: 27,
    isProBadge: true,
    isFeatured: false,
    fullAvailability: true,
  },
  {
    name: "Noora Al Sabah",
    email: "noora.alsabah@demo.gulfpaws.app",
    city: "KUWAIT_CITY",
    currency: "KWD",
    areas: ["Salmiya", "Jabriya"],
    services: ["CAT_SITTING"],
    hourlyRate: 6,
    languages: ["ARABIC", "ENGLISH"],
    bio: "Gentle, patient cat sitter. I work quietly and follow your routine exactly.",
    yearsExperience: 4,
    verificationStatus: "APPROVED",
    ratingAverage: 4.4,
    ratingCount: 11,
    isProBadge: false,
    isFeatured: false,
    fullAvailability: true,
  },
  {
    name: "John Fernandes",
    email: "john.fernandes@demo.gulfpaws.app",
    city: "MANAMA",
    currency: "BHD",
    areas: ["Juffair", "Seef"],
    services: ["DOG_WALKING"],
    hourlyRate: 6,
    languages: ["ENGLISH", "TAGALOG"],
    bio: "Reliable daily dog walker across Manama, rain or shine (mostly shine).",
    yearsExperience: 5,
    verificationStatus: "APPROVED",
    ratingAverage: 4.8,
    ratingCount: 19,
    isProBadge: false,
    isFeatured: true,
    fullAvailability: true,
  },
  {
    name: "Aisha Al Balushi",
    email: "aisha.albalushi@demo.gulfpaws.app",
    city: "MUSCAT",
    currency: "OMR",
    areas: ["Al Khuwair", "Qurum"],
    services: ["DOG_WALKING", "CAT_SITTING"],
    hourlyRate: 6,
    languages: ["ARABIC", "ENGLISH"],
    bio: "New to the platform — offering both dog walks and cat visits across Muscat.",
    yearsExperience: 2,
    verificationStatus: "PENDING",
    ratingAverage: null,
    ratingCount: 0,
    isProBadge: false,
    isFeatured: false,
    fullAvailability: true,
  },
];

async function main() {
  const passwordHash = await hashed();

  // --- Admin ---
  await prisma.user.upsert({
    where: { email: "admin@gulfpaws.app" },
    create: {
      name: "GulfPaws Admin",
      email: "admin@gulfpaws.app",
      passwordHash,
      emailVerified: new Date(),
      roles: ["ADMIN"],
      activeRole: "ADMIN",
      hasSelectedRole: true,
    },
    update: {},
  });

  // --- Demo owners ---
  const owner1 = await prisma.user.upsert({
    where: { email: "sara.owner@demo.gulfpaws.app" },
    create: {
      name: "Sara Al Maktoum",
      email: "sara.owner@demo.gulfpaws.app",
      passwordHash,
      emailVerified: new Date(),
      city: "DUBAI",
      roles: ["OWNER"],
      activeRole: "OWNER",
      hasSelectedRole: true,
    },
    update: {},
  });

  await prisma.pet.upsert({
    where: { id: "seed-pet-max" },
    create: {
      id: "seed-pet-max",
      ownerId: owner1.id,
      name: "Max",
      type: "DOG",
      breed: "Labrador",
      age: 2,
      temperament: "Energetic, loves other dogs, knows basic commands.",
    },
    update: {},
  });

  // --- Caregivers ---
  for (const c of CAREGIVERS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      create: {
        name: c.name,
        email: c.email,
        passwordHash,
        emailVerified: new Date(),
        city: c.city,
        roles: ["CAREGIVER"],
        activeRole: "CAREGIVER",
        hasSelectedRole: true,
      },
      update: {},
    });

    const profile = await prisma.caregiverProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        city: c.city,
        areas: c.areas,
        services: c.services,
        hourlyRate: c.hourlyRate,
        currency: c.currency,
        languages: c.languages,
        bio: c.bio,
        yearsExperience: c.yearsExperience,
        verificationStatus: c.verificationStatus,
        ratingAverage: c.ratingAverage,
        ratingCount: c.ratingCount,
        isProBadge: c.isProBadge,
        isFeaturedUntil: c.isFeatured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        profileCompleteness: c.verificationStatus === "APPROVED" ? 85 : 55,
      },
      update: {},
    });

    const slots = c.fullAvailability ? fullDaySlots() : COOL_HOUR_SLOTS;
    await prisma.availabilitySlot.deleteMany({ where: { caregiverProfileId: profile.id } });
    for (let day = 0; day <= 6; day++) {
      await prisma.availabilitySlot.createMany({
        data: slots.map((startMinute) => ({ caregiverProfileId: profile.id, dayOfWeek: day, startMinute })),
        skipDuplicates: true,
      });
    }
  }

  // --- Promo code ---
  await prisma.promoCode.upsert({
    where: { code: "FIRST20" },
    create: {
      code: "FIRST20",
      description: "20% off your first booking",
      percentOff: 20,
      firstBookingOnly: true,
      isActive: true,
    },
    update: {},
  });

  // --- Platform settings ---
  await prisma.platformSetting.upsert({
    where: { key: "default_commission_rate" },
    create: { key: "default_commission_rate", value: "0.18" },
    update: {},
  });
  await prisma.platformSetting.upsert({
    where: { key: "pro_commission_rate" },
    create: { key: "pro_commission_rate", value: "0.10" },
    update: {},
  });

  console.log(`Seeded ${CAREGIVERS.length} caregivers, 1 admin, 1 demo owner, 1 promo code.`);
  console.log(`All demo accounts use password: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
