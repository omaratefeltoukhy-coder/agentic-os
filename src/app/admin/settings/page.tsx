import { getCommissionRates } from "@/lib/platform-settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const { defaultRate, proRate } = await getCommissionRates();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sand">Platform settings</h1>
      <div className="mt-6">
        <SettingsForm defaultRate={defaultRate} proRate={proRate} />
      </div>
    </div>
  );
}
