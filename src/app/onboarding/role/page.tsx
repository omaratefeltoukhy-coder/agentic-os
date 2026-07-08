import { Suspense } from "react";
import { RoleSelectForm } from "@/components/auth/role-select-form";

export default function RoleSelectPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Suspense>
          <RoleSelectForm />
        </Suspense>
      </div>
    </div>
  );
}
