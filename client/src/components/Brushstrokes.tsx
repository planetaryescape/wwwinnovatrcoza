interface BrushstrokeProps {
  color?: string;
  opacity?: number;
  className?: string;
  width?: number;
  height?: number;
  rotation?: number;
}

export function CircleBrush({ 
  color = "#0033FF", 
  opacity = 0.6, 
  className = "",
  width = 180,
  height = 80,
  rotation = -2
}: BrushstrokeProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ 
        position: 'absolute',
        pointerEvents: 'none',
        transform: `rotate(${rotation}deg)`
      }}
    >
      <defs>
        <filter id="brush-soft">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      <path
        d="M 90 5 C 140 8, 165 25, 170 40 C 165 55, 140 72, 90 75 C 40 72, 15 55, 10 40 C 15 25, 40 8, 90 5 Z"
        stroke={color}
        strokeWidth="10"
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#brush-soft)"
      />
    </svg>
  );
}

export function ArcBrush({ 
  color = "#0033FF", 
  opacity = 0.6, 
  className = "",
  width = 200,
  height = 50,
  rotation = 0
}: BrushstrokeProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ 
        position: 'absolute',
        pointerEvents: 'none',
        transform: `rotate(${rotation}deg)`
      }}
    >
      <defs>
        <filter id="brush-arc-soft">
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>
      <path
        d="M 18 38 Q 50 12, 100 10 Q 150 12, 182 38"
        stroke={color}
        strokeWidth="11"
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#brush-arc-soft)"
      />
    </svg>
  );
}

export function SectionLabelBrush({ 
  color = "#0033FF", 
  opacity = 0.35, 
  className = "",
  width = 300,
  height = 32,
  rotation = -0.5
}: BrushstrokeProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ 
        position: 'absolute',
        pointerEvents: 'none',
        transform: `rotate(${rotation}deg)`
      }}
    >
      <defs>
        <filter id="brush-label-soft">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
      <path
        d="M 8 16 L 292 16"
        stroke={color}
        strokeWidth="20"
        opacity={opacity}
        strokeLinecap="round"
        filter="url(#brush-label-soft)"
      />
    </svg>
  );
}

export function HorizontalBrush({ 
  color = "#0033FF", 
  opacity = 0.35, 
  className = "",
  width = 500,
  height = 40,
  rotation = 0
}: BrushstrokeProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ 
        position: 'absolute',
        pointerEvents: 'none',
        transform: `rotate(${rotation}deg)`
      }}
    >
      <defs>
        <filter id="brush-horizontal-soft">
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>
      <path
        d="M 25 20 Q 125 18, 250 20 Q 375 22, 475 20"
        stroke={color}
        strokeWidth="16"
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#brush-horizontal-soft)"
      />
    </svg>
  );
}
