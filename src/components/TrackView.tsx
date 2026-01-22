// src/components/TrackView.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { pushToDataLayer } from '../utils/gtm';

interface TrackViewProps {
  children: React.ReactNode;
  eventName: string;
  category?: string;
  label?: string;
  threshold?: number;
  readTime?: number; // Tempo em ms para confirmar leitura (Default: 5000)
  debug?: boolean;
}

/**
 * TrackView
 * - Dispara {eventName, type: 'view'} quando o elemento entra na viewport (threshold)
 * - Dispara {eventName+'_read_confirmation', type: 'read_confirmation'} se o elemento permanecer visível por `readTime`
 *
 * Observação: evita usar `display: 'contents'` no wrapper porque em alguns cenários o IntersectionObserver não detecta.
 * Se o wrapper realmente usa display: contents, tentamos observar o primeiro filho disponível.
 */
export const TrackView: React.FC<TrackViewProps> = ({
  children,
  eventName,
  category,
  label,
  threshold = 0.5,
  readTime = 5000,
  debug = false,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const [hasTriggeredView, setHasTriggeredView] = useState(false);
  const [hasTriggeredRead, setHasTriggeredRead] = useState(false);

  useEffect(() => {
    const rootEl = ref.current;
    if (!rootEl) return;

    // Se já disparou ambos, nada a fazer
    if (hasTriggeredView && hasTriggeredRead) return;

    // Fallback: se IntersectionObserver não suportado, dispare imediatamente
    if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
      if (!hasTriggeredView) {
        pushToDataLayer({
          event: eventName,
          category,
          label,
          type: 'view',
        });
        setHasTriggeredView(true);
      }
      if (!hasTriggeredRead) {
        timerRef.current = window.setTimeout(() => {
          pushToDataLayer({
            event: `${eventName}_read_confirmation`,
            category,
            label,
            type: 'read_confirmation',
          });
          setHasTriggeredRead(true);
        }, readTime);
      }
      return () => {
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // VIEW
          if (!hasTriggeredView) {
            if (debug) console.log('[TrackView] view ->', eventName, { category, label });
            pushToDataLayer({
              event: eventName,
              category,
              label,
              type: 'view',
            });
            setHasTriggeredView(true);
          }

          // READ CONFIRMATION
          if (!hasTriggeredRead && timerRef.current === null) {
            timerRef.current = window.setTimeout(() => {
              if (debug) console.log('[TrackView] read_confirmation ->', eventName, { category, label });
              pushToDataLayer({
                event: `${eventName}_read_confirmation`,
                category,
                label,
                type: 'read_confirmation',
              });
              setHasTriggeredRead(true);
              timerRef.current = null;
            }, readTime);
          }
        } else {
          // saiu da viewport: cancela o timer de leitura
          if (timerRef.current) {
            if (debug) console.log('[TrackView] saiu antes do readTime, cancelando timer ->', eventName);
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      { threshold }
    );

    // Se o wrapper tiver display: contents, observar o primeiro filho visível (workaround)
    let elementToObserve: Element | null = rootEl;
    try {
      const cs = window.getComputedStyle(rootEl);
      if (cs && cs.display === 'contents') {
        // tenta observar o primeiro filho que existe
        const firstChild = rootEl.firstElementChild;
        if (firstChild) {
          elementToObserve = firstChild;
          if (debug) console.log('[TrackView] wrapper display:contents — observando primeiro filho', firstChild);
        } else {
          // sem filhos ainda: observar o wrapper (pode não funcionar)
          if (debug) console.log('[TrackView] wrapper display:contents mas sem filhos — observando wrapper', rootEl);
        }
      }
    } catch (e) {
      // getComputedStyle pode falhar raramente; ignorar e observar o root
      if (debug) console.warn('[TrackView] erro ao checar computedStyle', e);
    }

    if (elementToObserve) {
      observer.observe(elementToObserve);
    }

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasTriggeredView,
    hasTriggeredRead,
    eventName,
    category,
    label,
    threshold,
    readTime,
    debug,
  ]);

  // Use um wrapper normal (evitar display: 'contents' por padrão)
  // Se precisar manter layout exato, remova o style aqui e ajuste o CSS externo.
  return (
    <div ref={ref} style={{ display: 'block' }}>
      {children}
    </div>
  );
};
