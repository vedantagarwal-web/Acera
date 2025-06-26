'use client';

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/cn';
import { widgetAnimation, widgetTransition } from '@/lib/framer';
import { X, GripVertical } from 'lucide-react';
import { useWidgetStore } from '@/lib/store';

interface WidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
}

export function Widget({ id, title, children, className, onRemove }: WidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const theme = useWidgetStore((state) => state.theme);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-xl backdrop-blur-md',
        'border border-white/10',
        'shadow-lg shadow-black/5',
        className
      )}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={widgetAnimation}
      transition={widgetTransition}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-50"
        style={{ background: theme.primaryGradient }}
      />
      <div className="relative p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded"
            >
              <GripVertical className="w-4 h-4 text-white/50" />
            </div>
            <h3 className="font-medium text-white/90">{title}</h3>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 hover:bg-white/5 rounded group"
            >
              <X className="w-4 h-4 text-white/50 group-hover:text-white/90" />
            </button>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );
} 