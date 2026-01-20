'use client';
import React, { useEffect, useRef, useState } from 'react';
import { pushToDataLayer } from '../utils/gtm';

interface TrackViewProps {
  children: React.ReactNode;
  eventName: string;
  category?: string;
  label?: string;
  threshold?: number; // 0.5 = 50% visível
}

export const TrackView: React.FC<TrackViewProps> = ({ 
  children, eventName, category, label, threshold = 0.5 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          pushToDataLayer({
            event: eventName,
            category,
            label,
            type: 'view',
          });
          setHasTriggered(true); // Garante que dispara apenas uma vez
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasTriggered, eventName, category, label, threshold]);

  return <div ref={ref} style={{ display: 'contents' }}>{children}</div>;
};