function currentGulfSeason() {
  const month = new Date().getUTCMonth() + 1; // 1-12
  // Roughly May-Sep is peak Gulf summer.
  return month >= 5 && month <= 9 ? "summer" : "mild";
}

export function HeatBanner() {
  const season = currentGulfSeason();

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
      <span className="text-lg">☀️</span>
      <div>
        <p className="font-medium text-gold">
          {season === "summer" ? "Peak heat season" : "Mild season"} — walk smart
        </p>
        <p className="mt-0.5 text-sand-dim">
          Midday (11:00–16:00) pavement can burn paws and risk heatstroke. We highlight cooler
          early-morning (05:30–07:00) and evening (18:30–21:00) slots for every caregiver.
        </p>
      </div>
    </div>
  );
}
