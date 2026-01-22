// src/utils/gtm.ts
type EventProps = {
  event: string;
  category?: string;
  label?: string;
  type?: string;
  [key: string]: any;
};

export const pushToDataLayer = (props: EventProps) => {
  if (typeof window === 'undefined') return;

  const { event, category, label, type, ...rest } = props;
  const timestamp = new Date().toISOString();

  // Parâmetros padronizados que você quer enviar
  const params = {
    event_category: category,
    event_label: label,
    event_type: type,
    interaction_time: timestamp,
    ...rest, // permite enviar dados extras
  };

  // 1) Se gtag está disponível (GA4 via gtag.js), usar gtag('event', ...)
  if (typeof (window as any).gtag === 'function') {
    try {
      (window as any).gtag('event', event, params);
      return;
    } catch (err) {
      // se falhar, cairá no dataLayer push abaixo
      // eslint-disable-next-line no-console
      console.warn('[NineTwo Tracking] gtag falhou, fallback para dataLayer', err);
    }
  }

  // 2) Fallback: push para dataLayer — funciona com GTM (desde que o container esteja configurado)
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event,
    ...params,
  });
};
