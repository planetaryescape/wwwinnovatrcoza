import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isOverHeading, setIsOverHeading] = useState(false);
  const [isOnLight, setIsOnLight] = useState(false);
  const cursorRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const isLightColor = (r: number, g: number, b: number) => {
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.7;
    };

    const checkBackgroundColor = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y);
      if (!element) return false;
      
      let current: Element | null = element;
      while (current) {
        const style = getComputedStyle(current);
        const bg = style.backgroundColor;
        
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const [, r, g, b] = match.map(Number);
            return isLightColor(r, g, b);
          }
        }
        current = current.parentElement;
      }
      return false;
    };

    const isLargeHeading = (element: Element | null): boolean => {
      if (!element) return false;
      
      const target = element as HTMLElement;
      if (target.hasAttribute('data-cursor-invert')) return true;
      if (target.closest('[data-cursor-invert]')) return true;
      
      const tagName = target.tagName;
      if (tagName === 'H1' || tagName === 'H2') {
        const style = getComputedStyle(target);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize >= 28) return true;
      }
      
      const parent = target.closest('h1, h2');
      if (parent) {
        const style = getComputedStyle(parent);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize >= 28) return true;
      }
      
      return false;
    };

    const updatePosition = () => {
      setPosition(prev => ({
        x: lerp(prev.x, cursorRef.current.x, 0.15),
        y: lerp(prev.y, cursorRef.current.y, 0.15)
      }));
      animationRef.current = requestAnimationFrame(updatePosition);
    };

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
      
      const element = document.elementFromPoint(e.clientX, e.clientY);
      setIsOverHeading(isLargeHeading(element));
      setIsOnLight(checkBackgroundColor(e.clientX, e.clientY));
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      }
    };

    const handleHoverEnd = () => {
      setIsHovering(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleHoverStart);
    document.addEventListener('mouseout', handleHoverEnd);
    
    animationRef.current = requestAnimationFrame(updatePosition);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleHoverStart);
      document.removeEventListener('mouseout', handleHoverEnd);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible]);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (isTouchDevice) return null;

  const isEnlarged = isHovering || isOverHeading;
  const size = isOverHeading ? 48 : (isHovering ? 32 : 12);
  const offset = size / 2;

  const cursorColor = isOnLight ? 'rgba(77, 95, 241, 0.7)' : 'rgba(255, 255, 255, 0.8)';
  const cursorColorHover = isOnLight ? 'rgba(77, 95, 241, 0.5)' : 'rgba(255, 255, 255, 0.6)';
  const glowColor = isOnLight ? 'rgba(77, 95, 241, 0.3)' : 'rgba(255, 255, 255, 0.25)';
  const glowColorHover = isOnLight ? 'rgba(77, 95, 241, 0.4)' : 'rgba(255, 255, 255, 0.35)';
  const borderColor = isOnLight ? 'rgba(77, 95, 241, 0.9)' : 'rgba(255, 255, 255, 0.9)';

  return (
    <motion.div
      className={`fixed pointer-events-none z-[9999] ${isOverHeading ? 'mix-blend-difference' : ''}`}
      animate={{
        x: position.x - offset,
        y: position.y - offset,
        opacity: isVisible ? 1 : 0
      }}
      transition={{
        type: "tween",
        duration: 0,
        ease: "linear"
      }}
    >
      <div 
        className="rounded-full transition-all duration-200 ease-out"
        style={{
          width: size,
          height: size,
          backgroundColor: isOverHeading 
            ? '#ffffff' 
            : (isHovering ? cursorColorHover : cursorColor),
          border: isOverHeading ? 'none' : `1.5px solid ${borderColor}`,
          boxShadow: isOverHeading 
            ? 'none'
            : (isEnlarged 
              ? `0 0 20px ${glowColorHover}, inset 0 0 10px ${glowColorHover}` 
              : `0 0 10px ${glowColor}`),
          backdropFilter: (isHovering && !isOverHeading) ? 'blur(2px)' : 'none'
        }}
      />
    </motion.div>
  );
}
