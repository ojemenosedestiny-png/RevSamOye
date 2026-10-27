"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

type Props = {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  external?: boolean;
};

/** Primary call-to-action that leans gently toward the pointer. */
export function MagneticButton({ href, onClick, variant = "primary", className = "", children, type = "button", disabled, external }: Props) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.38);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const cls = `${variant === "primary" ? "btn-primary" : "btn-secondary"} ${className}`;
  const shared = { className: cls, style: { x: sx, y: sy }, onMouseMove: onMove, onMouseLeave: reset, whileTap: { scale: 0.97 } };

  if (href) {
    return (
      <motion.a href={href} {...shared} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} onClick={onClick} disabled={disabled} {...shared}>
      {children}
    </motion.button>
  );
}
