'use client';

import { useEffect } from 'react';
import { pushToDataLayer } from '../utils/gtm'; 

const EXTERNAL_RULES = [
  {
    selector: '.rdstation-popup-js-floating-button', 
    eventType: 'click',
    data: {
      event: 'initiate_whatsapp',
      category: 'contact',
      label: 'whatsapp_floating_rd',
      type: 'click'
    }
  },
  {
    selector: '.rdstation-popup-js-form-identifier',
    eventType: 'submit',
    data: {
      event: 'complete_whatsapp',
      category: 'leads',
      label: 'rd_station_popup',
      type: 'submit'
    }
  }
];

export const useAutoTagExternal = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const attachListeners = () => {
      EXTERNAL_RULES.forEach((rule) => {
        const elements = document.querySelectorAll(rule.selector);
        
        elements.forEach((el) => {
          // Checagem de segurança: Se já processamos, ignora para não duplicar listeners
          if (el.getAttribute('data-nt-external-processed') === 'true') return;

          // 1. Marca como processado com uma flag interna (que o Global Listener ignora)
          el.setAttribute('data-nt-external-processed', 'true');

          // -----------------------------------------------------------
          // REMOVIDO: Não adicionamos mais 'data-nt-ut-event' aqui.
          // Isso impede que o useAutoTrackClick dispare o evento duplicado.
          // -----------------------------------------------------------

          // 2. Adiciona o listener manual (Único responsável pelo disparo)
          el.addEventListener(rule.eventType, (e) => {
            // Opcional: Pare a propagação se sentir que ainda está duplicando
            // e.stopImmediatePropagation(); 
            
            pushToDataLayer({
              event: rule.data.event,
              category: rule.data.category,
              label: rule.data.label,
              type: rule.data.type
            });
            
          }, true); // UseCapture
        });
      });
    };

    attachListeners();

    const observer = new MutationObserver((mutations) => {
      const hasAddedNodes = mutations.some(m => m.addedNodes.length > 0);
      if (hasAddedNodes) {
        attachListeners();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [enabled]);
};