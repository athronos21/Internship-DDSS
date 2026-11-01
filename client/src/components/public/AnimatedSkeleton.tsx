import React from 'react';
import { motion, Variants } from 'motion/react';

// Framer Motion Variants for Skeleton Container & Pulsing Items
export const skeletonContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const skeletonPulseVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 24,
    },
  },
};

export const breathingVariants: Variants = {
  animate: {
    opacity: [0.55, 0.95, 0.55],
    transition: {
      repeat: Infinity,
      duration: 1.8,
      ease: 'easeInOut',
    },
  },
};

// Shimmer gradient overlay component
export const ShimmerOverlay: React.FC = () => (
  <motion.div
    animate={{
      x: ['-100%', '200%'],
    }}
    transition={{
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent pointer-events-none z-10"
  />
);

// Product Card Skeleton with shimmer and staggered animation
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <motion.div
      variants={skeletonContainerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          variants={skeletonPulseVariants}
          className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 overflow-hidden"
        >
          <ShimmerOverlay />

          {/* Badge & Favorite placeholder */}
          <div className="flex justify-between items-start">
            <motion.div
              variants={breathingVariants}
              animate="animate"
              className="h-5 w-24 bg-emerald-100 dark:bg-emerald-950/60 rounded-full"
            />
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          </div>

          {/* Title & Generic name */}
          <div className="space-y-2">
            <motion.div
              variants={breathingVariants}
              animate="animate"
              className="h-5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>

          {/* Attributes */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="h-8 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
            <div className="h-8 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          </div>

          {/* Price & Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-9 w-24 bg-emerald-600/30 rounded-xl" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Orders List Skeleton
export const OrderListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <motion.div
      variants={skeletonContainerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          variants={skeletonPulseVariants}
          className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4 overflow-hidden"
        >
          <ShimmerOverlay />
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60" />
              <div className="space-y-1">
                <motion.div
                  variants={breathingVariants}
                  animate="animate"
                  className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md"
                />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="h-6 w-28 bg-emerald-100 dark:bg-emerald-950/60 rounded-full" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3.5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="h-5 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-9 w-28 bg-emerald-600/30 rounded-xl" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Favorites Wishlist Skeleton
export const FavoritesSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <motion.div
      variants={skeletonContainerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <motion.div
          key={idx}
          variants={skeletonPulseVariants}
          className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 overflow-hidden"
        >
          <ShimmerOverlay />
          <div className="flex justify-between items-start">
            <div className="h-5 w-24 bg-rose-100 dark:bg-rose-950/60 rounded-full" />
            <div className="h-8 w-8 bg-rose-100 dark:bg-rose-950/60 rounded-full" />
          </div>
          <div className="space-y-2">
            <motion.div
              variants={breathingVariants}
              animate="animate"
              className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg"
            />
            <div className="h-3.5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-9 w-28 bg-emerald-600/30 rounded-xl" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Prescription Verification & Review Skeleton
export const PrescriptionReviewSkeleton: React.FC = () => {
  return (
    <motion.div
      variants={skeletonContainerVariants}
      initial="hidden"
      animate="show"
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 overflow-hidden relative shadow-md"
    >
      <ShimmerOverlay />
      <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <motion.div
            variants={breathingVariants}
            animate="animate"
            className="h-5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md"
          />
          <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl">
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="space-y-2">
          <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        </div>
      </div>
    </motion.div>
  );
};

// Simple Content Card Skeleton
export const CardSkeleton: React.FC<{ height?: string }> = ({ height = 'h-48' }) => {
  return (
    <motion.div
      variants={skeletonPulseVariants}
      initial="hidden"
      animate="show"
      className={`relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs overflow-hidden ${height}`}
    >
      <ShimmerOverlay />
      <div className="space-y-3 h-full flex flex-col justify-between">
        <motion.div
          variants={breathingVariants}
          animate="animate"
          className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg"
        />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-32 bg-emerald-600/30 rounded-2xl" />
      </div>
    </motion.div>
  );
};
