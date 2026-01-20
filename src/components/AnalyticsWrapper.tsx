import React, { ReactElement } from 'react';

// Interface para garantir que o DataLayer exista na window
declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface AnalyticsWrapperProps {
  children: ReactElement; // Força receber apenas 1 filho (o botão do outro projeto)
}

export const AnalyticsWrapper = ({ children }: AnalyticsWrapperProps) => {
  // Garante que é um elemento React válido
  if (!React.isValidElement(children)) {
    return <>{children}</>;
  }

  // 1. Extrai as props de GTM que o botão filho possui.
  // Estamos assumindo que o botão do outro projeto passará atributos 'data-gtm-*'
  const gtmEvent = children.props['data-gtm-event'];
  const gtmCategory = children.props['data-gtm-category'];
  const gtmLabel = children.props['data-gtm-label'];

  // 2. Cria a função que vai interceptar o clique
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // A) Dispara o evento pro Analytics se as tags existirem
    if (gtmEvent && typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      
      console.log('📡 Disparando GTM:', { event: gtmEvent, category: gtmCategory });
      
      window.dataLayer.push({
        event: gtmEvent,
        category: gtmCategory,
        label: gtmLabel,
        // Adicione outros dados que precisar
      });
    }

    // B) Executa o onClick original do botão do outro projeto (se existir)
    if (children.props.onClick) {
      children.props.onClick(event);
    }
  };

  // 3. Clona o elemento filho injetando o novo onClick
  return React.cloneElement(children, {
    // @ts-ignore - Ignora erro de tipo se o componente filho não tiver onClick explícito na tipagem
    onClick: handleClick,
  });
};