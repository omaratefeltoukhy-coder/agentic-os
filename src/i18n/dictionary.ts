export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export function isRtl(locale: string) {
  return locale === "ar";
}

const dictionary = {
  en: {
    nav: {
      browse: "Browse",
      login: "Log in",
      dashboard: "Dashboard",
    },
    landing: {
      tagline: "Pet care you can trust, across the Gulf.",
      subtitle:
        "Book vetted dog walkers and cat sitters near you — scheduled around the heat, paid in your currency, in Arabic or English.",
      ownerCardTitle: "I'm a pet owner",
      ownerCardBody: "Find a caregiver, book in 30-minute slots, and pay securely.",
      ownerCardCta: "Get started as an owner",
      caregiverCardTitle: "I offer pet care",
      caregiverCardBody: "Set your own rate and free time slots. Get paid, on your terms.",
      caregiverCardCta: "Become a caregiver",
      alreadyHaveAccount: "Already have an account?",
      justLooking: "Just looking?",
      browseAsGuest: "Browse caregivers as a guest",
    },
    common: {
      logIn: "Log in",
      signUp: "Sign up",
    },
  },
  ar: {
    nav: {
      browse: "تصفح",
      login: "تسجيل الدخول",
      dashboard: "لوحة التحكم",
    },
    landing: {
      tagline: "رعاية حيوانات أليفة تثق بها، في جميع أنحاء الخليج.",
      subtitle:
        "احجز مع مقدمي رعاية موثوقين لتمشية الكلاب ورعاية القطط بالقرب منك — بجدول يراعي الحرارة، وبالدفع بعملتك، بالعربية أو الإنجليزية.",
      ownerCardTitle: "أنا صاحب حيوان أليف",
      ownerCardBody: "ابحث عن مقدم رعاية، واحجز بفترات 30 دقيقة، وادفع بأمان.",
      ownerCardCta: "ابدأ كصاحب حيوان أليف",
      caregiverCardTitle: "أقدم رعاية للحيوانات",
      caregiverCardBody: "حدد سعرك وأوقات فراغك الخاصة. اربح مالاً بشروطك.",
      caregiverCardCta: "كن مقدم رعاية",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      justLooking: "فقط تتصفح؟",
      browseAsGuest: "تصفح مقدمي الرعاية كزائر",
    },
    common: {
      logIn: "تسجيل الدخول",
      signUp: "إنشاء حساب",
    },
  },
} as const;

export function getDictionary(locale: string) {
  return locale === "ar" ? dictionary.ar : dictionary.en;
}
