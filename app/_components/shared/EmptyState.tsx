type EmptyStateProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

function BotanicalIcon() {
  return (
    <svg viewBox="0 0 64 80" fill="none" width="52" height="65" aria-hidden="true">
      <path d="M32 72 C32 72 30 50 32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 52 C32 52 18 46 16 34 C16 34 28 36 32 52Z" fill="currentColor"/>
      <path d="M32 40 C32 40 20 32 20 20 C20 20 30 26 32 40Z" fill="currentColor"/>
      <path d="M32 46 C32 46 44 38 48 28 C48 28 36 30 32 46Z" fill="currentColor"/>
      <path d="M32 32 C32 32 42 22 40 12 C40 12 32 18 32 32Z" fill="currentColor"/>
      <path d="M32 28 C32 28 28 18 30 10 C30 10 36 16 32 28Z" fill="currentColor"/>
    </svg>
  );
}

export default function EmptyState({ title, subtitle, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-5 py-28">
      <div style={{ color: "var(--forest)", opacity: 0.18 }}>
        <BotanicalIcon />
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-display text-[17px]" style={{ color: "var(--text-2)" }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[13px]" style={{ color: "var(--text-3)", maxWidth: 300 }}>
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && (
        actionHref ? (
          <a
            href={actionHref}
            className="mt-1 rounded-full px-6 py-2.5 text-[13px] font-medium transition-all duration-200"
            style={{
              background: "var(--forest)",
              color: "#fff",
              fontFamily: "var(--font-display), Georgia, serif",
            }}
          >
            {actionLabel}
          </a>
        ) : (
          <button
            onClick={onAction}
            className="mt-1 rounded-full px-6 py-2.5 text-[13px] font-medium transition-all duration-200"
            style={{
              background: "var(--forest)",
              color: "#fff",
              fontFamily: "var(--font-display), Georgia, serif",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
