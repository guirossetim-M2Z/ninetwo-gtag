'use client';

import React, { useEffect } from 'react';
import { useAutoTrackClick } from './hooks/useAutoTrackClick';
import { useAutoTrackSubmit } from './hooks/useAutoTrackSubmit';

interface TrackingProviderProps {
  children: React.ReactNode;
  gtmId?: string; // Pode ser G-XXXX (GA4) ou GTM-XXXX
  debug?: boolean;
}

export const TrackingProvider: React.FC<TrackingProviderProps> = ({
  children,
  gtmId,
  debug = false,
}) => {
  // 🔹 Listeners globais
  useAutoTrackClick(true);
  useAutoTrackSubmit(true);

  useEffect(() => {
    if (!gtmId || typeof window === 'undefined') {
      if (debug && !gtmId) {
        console.warn('[NineTwo Tracking] Nenhum ID fornecido.');
      }
      return;
    }

    const isGA4 = gtmId.startsWith('G-');
    const isGTM = gtmId.startsWith('GTM-');

    if (!isGA4 && !isGTM) {
      console.warn('[NineTwo Tracking] ID inválido:', gtmId);
      return;
    }

    // Evita reinjeção
    const existing = document.querySelector(
      `script[data-ninetwo-tracking="${gtmId}"]`
    );
    if (existing) {
      if (debug) {
        console.log('[NineTwo Tracking] Script já carregado:', gtmId);
      }
      return;
    }

    // Garante dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];

    // =========================
    // ✅ GA4 — gtag.js
    // =========================
    if (isGA4) {
      if (debug) {
        console.log('[NineTwo Tracking] Inicializando GA4:', gtmId);
      }

      // Script externo
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gtmId}`;
      gtagScript.setAttribute('data-ninetwo-tracking', gtmId);

      gtagScript.onload = () => {
        if (debug) {
          console.log('[NineTwo Tracking] gtag.js carregado com sucesso');
        }
      };

      gtagScript.onerror = () => {
        console.error('[NineTwo Tracking] Erro ao carregar gtag.js');
      };

      document.head.appendChild(gtagScript);

      // Script inline de configuração
      const inlineScript = document.createElement('script');
      inlineScript.setAttribute('data-ninetwo-tracking', `${gtmId}-inline`);
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gtmId}', {
          send_page_view: true
        });
      `;

      document.head.appendChild(inlineScript);
    }

    // =========================
    // ✅ GTM — gtm.js
    // =========================
    if (isGTM) {
      if (debug) {
        console.log('[NineTwo Tracking] Inicializando GTM:', gtmId);
      }

      (window as any).dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js',
      });

      const gtmScript = document.createElement('script');
      gtmScript.async = true;
      gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      gtmScript.setAttribute('data-ninetwo-tracking', gtmId);

      gtmScript.onload = () => {
        if (debug) {
          console.log('[NineTwo Tracking] GTM carregado com sucesso');
        }
      };

      gtmScript.onerror = () => {
        console.error('[NineTwo Tracking] Erro ao carregar GTM');
      };

      document.head.appendChild(gtmScript);
    }
  }, [gtmId, debug]);

  return <>{children}</>;
};
