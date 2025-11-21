'use client';

function KPICard({ number, label, subtitle }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-emerald-500/20 rounded-2xl p-6 text-center hover:bg-white/10 transition-all hover:shadow-2xl hover:shadow-emerald-500/10">
      <div className="text-4xl font-bold text-emerald-400 mb-1">{number}</div>
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      <div className="text-xs text-orange-400 italic">{subtitle}</div>
    </div>
  );
}

export default function KPISection() {
  // Placeholder data - can be replaced with API call later
  const kpis = {
    prospects: 47,
    openTasks: 12,
    upcomingMeetings: 3,
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" role="region" aria-label="Executive dashboard">
      <KPICard
        number={kpis.prospects}
        label="Prospects"
        subtitle="Daily summary via email (coming soon)"
      />
      <KPICard
        number={kpis.openTasks}
        label="Open Tasks"
        subtitle="Daily summary via email (coming soon)"
      />
      <KPICard
        number={kpis.upcomingMeetings}
        label="Upcoming Meetings"
        subtitle="Daily summary via email (coming soon)"
      />
    </section>
  );
}
