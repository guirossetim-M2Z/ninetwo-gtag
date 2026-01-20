'use client';

import React, { useEffect } from 'react';
import { useAutoTrackClick } from './hooks/useAutoTrackClick';
import { useAutoTrackSubmit } from './hooks/useAutoTrackSubmit'; // <--- Import novo

interface TrackingProviderProps {
  children: React.ReactNode;
  gtmId?: string;
  debug?: boolean;
}

export const TrackingProvider: React.FC<TrackingProviderProps> = ({ 
  children, 
  gtmId, 
  debug = false 
}) => {
  
  // 1. Inicializa listeners globais
  useAutoTrackClick(true);
  useAutoTrackSubmit(true); // <--- Ativa o listener de formulários

  // 2. Injeção do Script do GTM
  useEffect(() => {
    if (!gtmId || typeof window === 'undefined') {
      if (debug && !gtmId) console.warn('[NineTwo Tracking] GTM ID não fornecido.');
      return;
    }

    const scriptId = 'ninetwo-gtm-script';
    if (document.getElementById(scriptId)) {
      if (debug) console.log('[NineTwo Tracking] Script já existente. Ignorando reinjeção.');
      return;
    }

    (window as any).dataLayer = (window as any).dataLayer || [];
    
    (window as any).dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    
    script.onload = () => {
      if (debug) console.log(`[NineTwo Tracking] ✅ GTM carregado com sucesso! (${gtmId})`);
    };

    script.onerror = () => {
      if (debug) console.error('[NineTwo Tracking] ❌ Erro ao carregar GTM.');
    };

    document.head.appendChild(script);

  }, [gtmId, debug]);

  return <>{children}</>;
};