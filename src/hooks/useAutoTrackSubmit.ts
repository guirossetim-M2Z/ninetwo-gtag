'use client';

import { useEffect } from 'react';
import { pushToDataLayer } from '../utils/gtm';

export const useAutoTrackSubmit = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    const handleSubmit = (e: SubmitEvent) => {
      const target = e.target as HTMLElement;

      // Procura o formulário mais próximo que tenha o atributo de rastreamento
      // Note que usamos 'form' explicitamente para garantir que é um envio
      const formElement = target.closest('form[data-nt-ut-event]');

      if (formElement) {
        const eventName = formElement.getAttribute('data-nt-ut-event');
        const category = formElement.getAttribute('data-nt-ut-category');
        const label = formElement.getAttribute('data-nt-ut-label');
        const type = formElement.getAttribute('data-nt-ut-type');

        pushToDataLayer({
          event: eventName || 'form_submit',
          category: category || 'form',
          label: label || '',
          type: type || 'submit', // Padrão agora é 'submit'
        });
      }
    };

    // 'true' no final ativa o useCapture, capturando o evento antes que o React ou outros libs parem a propagação
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, [enabled]);
};