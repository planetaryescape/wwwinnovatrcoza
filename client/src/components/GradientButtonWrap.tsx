interface GradientButtonWrapProps {
  variant?: "violet" | "coral";
  borderRadius?: number | string;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

export function GradientButtonWrap({
  variant = "violet",
  borderRadius = 12,
  style,
  className = "",
  children,
}: GradientButtonWrapProps) {
  return (
    <div
      className={`grad-btn-wrap${className ? ` ${className}` : ""}`}
      style={{ borderRadius, ...style }}
    >
      <div className={`grad-btn-glow grad-btn-glow-${variant}`} />
      {children}
    </div>
  );
}
