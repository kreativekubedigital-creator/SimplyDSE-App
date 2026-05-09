import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  className?: string;
  hFull?: boolean;
}

const Reveal = ({ 
  children, 
  width = "fit-content", 
  delay = 0, 
  direction = "up", 
  distance = 20,
  className = "",
  hFull = false
}: RevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
      x: direction === "left" ? distance : direction === "right" ? -distance : 0,
      scale: 0.98,
      filter: "blur(12px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        delay: delay,
        ease: [0.23, 1, 0.32, 1] as any
      }
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", width, height: hFull ? "100%" : "auto", overflow: "visible" }} className={className}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={mainControls}
        className={hFull ? "h-full" : ""}
        style={hFull ? { height: "100%" } : {}}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Reveal;
