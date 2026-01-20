type EventProps = {
  event: string;
  category?: string;
  label?: string;
  type?: string;
  [key: string]: any; // Para dados extras
};

export const pushToDataLayer = (props: EventProps) => {
  if (typeof window === 'undefined') return;

  const dataLayer = (window as any).dataLayer || [];
  
  // Padroniza o evento para o GA4/UA
  dataLayer.push({
    event: props.event, // Nome do evento (ex: 'click_cta')
    event_category: props.category,
    event_label: props.label,
    event_type: props.type,
    interaction_time: new Date().toISOString(),
  });
};