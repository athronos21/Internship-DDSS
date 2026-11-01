import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to Top"
      className="fixed bottom-24 right-6 z-40 p-3 rounded-2xl bg-emerald-600 text-white shadow-xl hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all border border-emerald-500/50 flex items-center justify-center group"
    >
      <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};
