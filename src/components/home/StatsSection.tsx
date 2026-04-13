export default function StatsSection() {
  const statsStrip = [
    { value: '12 400+', label: 'Investisseurs actifs' },
    { value: '820 Mrd', label: 'MAD Actifs suivis' },
    { value: '250+',    label: 'Analyses publiées' },
    { value: '180+',    label: 'OPCVM trackés' },
  ];

  return (
    <section className="bg-[var(--bg-base)] border-y border-[var(--border)] py-[var(--space-lg)] px-[var(--space-md)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-0 font-body">
        {statsStrip.map((stat, idx) => (
          <div key={stat.label} className="flex items-center flex-1 justify-center relative w-full">
            <div className="text-center md:text-left">
              <p className="font-display text-[40px] font-medium leading-none text-[var(--text-primary)] mb-2">
                {stat.value}
              </p>
              <p className="font-body text-[13px] font-normal text-[var(--text-secondary)] uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
            
            {/* Vertical Divider */}
            {idx < statsStrip.length - 1 && (
              <div className="hidden md:block h-10 w-px bg-[var(--border)] absolute right-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
