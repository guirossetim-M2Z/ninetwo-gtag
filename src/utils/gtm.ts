// src/utils/gtm.ts

type EventProps = {
  event: string;
  category?: string;
  label?: string;
  type?: string;
  [key: string]: any;
};

// Chaves que queremos monitorar e persistir
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid", // Google Ads ID
  "fbclid", // Facebook Click ID
  "ttclid", // TikTok Click ID
];

// Função auxiliar para capturar e salvar na sessão (chamada apenas no Provider)
export const captureAttribution = () => {
  if (typeof window === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  let hasNewData = false;

  ATTRIBUTION_KEYS.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      sessionStorage.setItem(`nt_attr_${key}`, value);
      hasNewData = true;
    }
  });

  // Se não tem UTMs na URL, verificamos se tem Referrer (origem orgânica/site externo)
  // Só salvamos referrer se não houver UTMs já salvas, para não sobrescrever uma campanha paga
  if (!sessionStorage.getItem("nt_attr_utm_source") && document.referrer) {
    const referrerUrl = new URL(document.referrer);
    // Ignora se for o próprio site (navegação interna)
    if (referrerUrl.hostname !== window.location.hostname) {
      sessionStorage.setItem("nt_attr_utm_source", "referral");
      sessionStorage.setItem("nt_attr_utm_medium", referrerUrl.hostname);
    }
  }
};

// Função auxiliar para ler os dados salvos
const getPersistedAttribution = () => {
  if (typeof window === "undefined") return {};

  const attributionData: Record<string, string> = {};

  ATTRIBUTION_KEYS.forEach((key) => {
    const val = sessionStorage.getItem(`nt_attr_${key}`);
    if (val) attributionData[key] = val; // Ex: utm_source: 'google'
  });

  return attributionData;
};

export const pushToDataLayer = (props: EventProps) => {
  if (typeof window === "undefined") return;

  const dataLayer = (window as any).dataLayer || [];

  // Mescla os dados do evento com os dados de atribuição persistidos
  const payload = {
    ...getPersistedAttribution(), // <--- A MÁGICA ACONTECE AQUI
    event: props.event,
    event_category: props.category,
    event_label: props.label,
    event_type: props.type,
    interaction_time: new Date().toISOString(),
    ...props, // Permite sobrescrever se necessário
  };

  dataLayer.push(payload);
};
