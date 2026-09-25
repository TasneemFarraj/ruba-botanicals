interface Props {
  eyebrow?: string;
  heading: React.ReactNode;
  desc?: string;
  align?: "start" | "center";
  className?: string;
}

export default function SectionHeader({ eyebrow, heading, desc, align = "start", className = "" }: Props) {
  return (
    <div className={`${align === "center" ? "text-center" : ""} ${className}`.trim()}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="section-title font-display">{heading}</h2>
      {desc && <p className="section-desc">{desc}</p>}
    </div>
  );
}
