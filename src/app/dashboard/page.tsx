import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.activeRole === "ADMIN") redirect("/admin");
  redirect(session.user.activeRole === "CAREGIVER" ? "/dashboard/caregiver" : "/dashboard/owner");
}
