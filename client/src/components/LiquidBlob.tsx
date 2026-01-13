import { motion } from "framer-motion";

interface LiquidBlobProps {
  text: string;
  className?: string;
}

export default function LiquidBlob({ text, className = "" }: LiquidBlobProps) {
  const blobVariants = {
    animate: {
      d: [
        "M45.3,-51.2C58.4,-41.5,68.5,-26.7,71.1,-10.3C73.7,6.1,68.8,24.1,58.4,37.3C48,50.5,32.1,58.9,14.8,64.1C-2.5,69.3,-21.2,71.3,-36.8,64.5C-52.4,57.7,-64.9,42.1,-70.3,24.4C-75.7,6.7,-74,-13.1,-65.5,-28.5C-57,-43.9,-41.7,-54.9,-25.8,-63.8C-9.9,-72.7,6.6,-79.5,21.6,-75.8C36.6,-72.1,50.1,-57.9,45.3,-51.2Z",
        "M42.7,-48.5C55.1,-38.8,64.4,-24.5,68.2,-8.1C72,8.3,70.3,26.8,61.1,40.6C51.9,54.4,35.2,63.5,17.3,68.3C-0.6,73.1,-19.7,73.6,-35.8,66.6C-51.9,59.6,-65,45.1,-71.4,27.9C-77.8,10.7,-77.5,-9.2,-70.1,-25.4C-62.7,-41.6,-48.2,-54.1,-33.1,-63.1C-18,-72.1,-2.3,-77.6,12.1,-74.8C26.5,-72,48.6,-60.9,42.7,-48.5Z",
        "M47.4,-54.1C60.5,-44.6,69.3,-28.8,72.2,-11.8C75.1,5.2,72.1,23.4,62.4,37.2C52.7,51,36.3,60.4,18.5,66.5C0.7,72.6,-18.5,75.4,-34.4,69.1C-50.3,62.8,-62.9,47.4,-69.8,29.6C-76.7,11.8,-77.9,-8.4,-71.3,-25.1C-64.7,-41.8,-50.3,-55,-34.7,-63.7C-19.1,-72.4,-2.3,-76.6,13.4,-73.8C29.1,-71,42.3,-61.2,47.4,-54.1Z",
        "M45.3,-51.2C58.4,-41.5,68.5,-26.7,71.1,-10.3C73.7,6.1,68.8,24.1,58.4,37.3C48,50.5,32.1,58.9,14.8,64.1C-2.5,69.3,-21.2,71.3,-36.8,64.5C-52.4,57.7,-64.9,42.1,-70.3,24.4C-75.7,6.7,-74,-13.1,-65.5,-28.5C-57,-43.9,-41.7,-54.9,-25.8,-63.8C-9.9,-72.7,6.6,-79.5,21.6,-75.8C36.6,-72.1,50.1,-57.9,45.3,-51.2Z",
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.8 }}
      className={`relative ${className}`}
      data-testid="liquid-blob-container"
    >
      <div className="relative w-[clamp(280px,80vw,600px)] h-[clamp(100px,20vw,160px)]">
        <svg
          viewBox="0 0 200 100"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
          </defs>
          
          <g transform="translate(100, 50) scale(0.55, 0.45)">
            <motion.path
              fill="url(#blobGradient)"
              filter="url(#glow)"
              variants={blobVariants}
              animate="animate"
            />
          </g>
        </svg>
        
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ borderRadius: "50%" }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
              width: "50%",
            }}
          />
        </motion.div>
        
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)",
          }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <p 
            className="text-white/80 text-xs sm:text-sm md:text-base lg:text-lg font-sans text-center px-4 sm:px-8 leading-relaxed"
            style={{ fontFamily: "Roboto, sans-serif" }}
            data-testid="text-blob-subheading"
          >
            {text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
