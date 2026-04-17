interface GradientButtonWrapProps {
  variant?: "violet" | "coral";
  borderRadius?: number | string;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

export function GradientButtonWrap({
  variant = "violet",
  borderRadius = 12,
  disabled = false,
  style,
  className = "",
  children,
}: GradientButtonWrapProps) {
  const outerRadius = typeof borderRadius === "number" ? borderRadius + 2 : borderRadius;

  return (
    <div
      className={`grad-btn-wrap${disabled ? " grad-btn-wrap-disabled" : ""}${className ? ` ${className}` : ""}`}
      style={{ borderRadius: outerRadius, ...style }}
    >
      <div className={`grad-btn-glow grad-btn-glow-${variant}`} />
      {children}
    </div>
  );
}
