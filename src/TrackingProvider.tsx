'use client';

import React, { useEffect } from 'react';
import { useAutoTrackClick } from './hooks/useAutoTrackClick';
import { useAutoTrackSubmit } from './hooks/useAutoTrackSubmit';
import { captureAttribution } from './utils/gtm';
import { useAutoTagRDStation } from './hooks/useAutoTagRDStation';

interface TrackingProviderProps {
  children: React.ReactNode;
  gtmId?: string; // Ex: GTM-XXXXXX
  debug?: boolean;
}

export const TrackingProvider: React.FC<TrackingProviderProps> = ({ 
  children, 
  gtmId, 
  debug = false 
}) => {
  
  // 1. Inicializa listeners globais de interação
  useAutoTrackClick(true);   // Cliques
  useAutoTrackSubmit(true);  // Formulários
  useAutoTagRDStation(true); // <--- Ativa a etiquetagem automática

  // 2. Captura UTMs e Referrer para Atribuição (Persistência)
  useEffect(() => {
    captureAttribution();
    
    if (debug) {
      const source = typeof sessionStorage !== 'undefined' 
        ? sessionStorage.getItem('nt_attr_utm_source') 
        : null;
        
      if (source) {
        console.log(`[NineTwo Tracking] 🔗 Origem capturada: ${source}`);
      }
    }
  }, [debug]);

  // 3. Injeção do Script do GTM
  useEffect(() => {
    // Validações iniciais
    if (typeof window === 'undefined') return;
    
    if (!gtmId) {
      if (debug) console.warn('[NineTwo Tracking] ⚠️ GTM ID não fornecido.');
      return;
    }

    const scriptId = 'ninetwo-gtm-script';

    // Evita duplicidade de script
    if (document.getElementById(scriptId)) {
      if (debug) console.log('[NineTwo Tracking] ℹ️ Script GTM já existente. Ignorando reinjeção.');
      return;
    }

    // --- SNIPPET GTM ---
    
    // Inicializa dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    
    // Push do evento inicial
    (window as any).dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Cria tag script
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    
    // Callbacks de Debug
    script.onload = () => {
      if (debug) console.log(`[NineTwo Tracking] ✅ GTM carregado com sucesso! (${gtmId})`);
    };

    script.onerror = () => {
      if (debug) console.error('[NineTwo Tracking] ❌ Erro ao carregar script do GTM. Verifique AdBlockers.');
    };

    // Injeção no Head
    document.head.appendChild(script);

  }, [gtmId, debug]);

  return <>{children}</>;
};