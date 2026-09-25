interface Props {
  total: number;
  active: number;
  onSelect: (i: number) => void;
}

export default function DotPaginator({ total, active, onSelect }: Props) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2" dir="ltr">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`الصفحة ${i + 1}`}
          style={{
            width: i === active ? 20 : 6,
            height: 4,
            borderRadius: 99,
            background: i === active ? "rgba(28,58,26,0.5)" : "rgba(28,58,26,0.18)",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transition: "width 0.35s ease, background 0.35s ease",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}
