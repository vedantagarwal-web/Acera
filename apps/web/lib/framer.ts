import { Variants, Transition } from 'framer-motion'

export const glassCard: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', duration: 0.25 } },
}

export const hoverCard: Variants = {
  rest: { scale: 1, rotateX: 0 },
  hover: { scale: 1.02, rotateX: 1, transition: { type: 'spring', duration: 0.25 } },
}

export const widgetAnimation: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const widgetTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20
}; 