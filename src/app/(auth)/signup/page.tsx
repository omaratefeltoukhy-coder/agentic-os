import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; ref?: string }>;
}) {
  const { role, ref } = await searchParams;
  const initialRole = role === "caregiver" ? "CAREGIVER" : "OWNER";

  return <SignupForm initialRole={initialRole} referralCode={ref} />;
}
