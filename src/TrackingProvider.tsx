'use client';

import React, { useEffect } from 'react';
import { useAutoTrackClick } from './hooks/useAutoTrackClick';

interface TrackingProviderProps {
  children: React.ReactNode;
  gtmId?: string; // Ex: GTM-K5F5XX
  debug?: boolean;
}

export const TrackingProvider: React.FC<TrackingProviderProps> = ({ 
  children, 
  gtmId, 
  debug = false 
}) => {
  
  // 1. Inicializa o listener de cliques automático
  useAutoTrackClick(true);

  // 2. Injeção do Script do GTM
  useEffect(() => {
    // Se não tiver ID ou não estiver no browser, aborta
    if (!gtmId || typeof window === 'undefined') {
      if (debug && !gtmId) console.warn('[NineTwo Tracking] GTM ID não fornecido.');
      return;
    }

    // Verifica se já foi injetado para evitar duplicidade
    const scriptId = 'ninetwo-gtm-script';
    if (document.getElementById(scriptId)) {
      if (debug) console.log('[NineTwo Tracking] Script já existente. Ignorando reinjeção.');
      return;
    }

    // --- SNIPPET OFICIAL DO GOOGLE (Adaptado) ---
    
    // 1. Inicializa o array dataLayer se não existir
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // 2. Push do evento de início (gtm.start)
    (window as any).dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // 3. Criação da tag script
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gtmId}`;
    
    // Callback de sucesso (para debug)
    script.onload = () => {
      if (debug) console.log(`[NineTwo Tracking] ✅ GTM carregado com sucesso! (${gtmId})`);
    };

    // Callback de erro (comum com AdBlockers)
    script.onerror = () => {
      if (debug) console.error('[NineTwo Tracking] ❌ Erro ao carregar GTM. Verifique AdBlockers.');
    };

    // 4. Inserção no <head>
    document.head.appendChild(script);

  }, [gtmId, debug]);

  return <>{children}</>;
};