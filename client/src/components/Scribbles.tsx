export const CircleScribble = ({ 
  className = "", 
  color = "#ED876E", 
  opacity = 1 
}: { 
  className?: string; 
  color?: string; 
  opacity?: number; 
}) => (
  <svg 
    className={`absolute pointer-events-none ${className}`}
    width="100%" 
    height="100%" 
    viewBox="0 0 200 80" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <path
      d="M30,40 Q50,10 100,10 Q150,10 170,40 Q170,60 100,70 Q50,70 30,40"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export const UnderlineScribble = ({ 
  className = "", 
  color = "#4D5FF1", 
  opacity = 1 
}: { 
  className?: string; 
  color?: string; 
  opacity?: number; 
}) => (
  <svg 
    className={`absolute pointer-events-none ${className}`}
    width="100%" 
    height="20" 
    viewBox="0 0 200 20" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <path
      d="M10,10 Q60,15 100,10 Q140,5 190,12"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export const ArrowScribble = ({ 
  className = "", 
  color = "#4D5FF1", 
  opacity = 1 
}: { 
  className?: string; 
  color?: string; 
  opacity?: number; 
}) => (
  <svg 
    className={`absolute pointer-events-none ${className}`}
    width="60" 
    height="40" 
    viewBox="0 0 60 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <path
      d="M5,5 Q20,15 35,25 L45,20 M35,25 L40,35"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export const SquiggleScribble = ({ 
  className = "", 
  color = "#4D5FF1", 
  opacity = 1 
}: { 
  className?: string; 
  color?: string; 
  opacity?: number; 
}) => (
  <svg 
    className={`absolute pointer-events-none ${className}`}
    width="50" 
    height="50" 
    viewBox="0 0 50 50" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <path
      d="M10,25 Q15,10 25,15 Q35,20 30,30 Q25,40 15,35"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export const HighlighterScribble = ({ 
  className = "", 
  color = "#FFF59D", 
  opacity = 0.4 
}: { 
  className?: string; 
  color?: string; 
  opacity?: number; 
}) => (
  <span 
    className={`absolute pointer-events-none ${className}`}
    style={{
      background: color,
      opacity,
      height: '60%',
      top: '25%',
      left: '-4px',
      right: '-4px',
      zIndex: -1,
      borderRadius: '2px',
    }}
  />
);

export const StarScribble = ({ 
  className = "", 
  color = "#ED876E", 
  opacity = 1 
}: { 
  className?: string; 
  color?: string; 
  opacity?: number; 
}) => (
  <svg 
    className={`absolute pointer-events-none ${className}`}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <path
      d="M12,2 L14,9 L21,10 L15,14 L17,21 L12,17 L7,21 L9,14 L3,10 L10,9 Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export const BracketScribble = ({ 
  className = "", 
  color = "#4D5FF1", 
  opacity = 0.6 
}: { 
  className?: string; 
  color?: string; 
  opacity?: number; 
}) => (
  <svg 
    className={`absolute pointer-events-none ${className}`}
    width="100%" 
    height="100%" 
    viewBox="0 0 20 60" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <path
      d="M15,5 Q5,10 5,30 Q5,50 15,55"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export const SubtleUnderline = ({ 
  className = "", 
  color = "#B8E6B8", 
  opacity = 0.4 
}: { 
  className?: string; 
  color?: string; 
  opacity?: number; 
}) => (
  <svg 
    className={`absolute pointer-events-none ${className}`}
    width="100%" 
    height="8" 
    viewBox="0 0 100 8" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
  >
    <path
      d="M5,4 Q30,6 50,4 Q70,2 95,5"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);
