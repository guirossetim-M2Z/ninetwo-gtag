"use client";
import { useEffect } from "react";
import { pushToDataLayer } from "../utils/gtm";

export const useAutoTrackClick = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Procura o elemento mais próximo com o atributo 'data-nt-ut-event'
      const trackingElement = target.closest("[data-nt-ut-event]");

      if (trackingElement) {
        // Extrai os valores dos atributos
        const eventName = trackingElement.getAttribute("data-nt-ut-event");
        const category = trackingElement.getAttribute("data-nt-ut-category");
        const label = trackingElement.getAttribute("data-nt-ut-label");
        const type = trackingElement.getAttribute("data-nt-ut-type");

        // Só dispara se o tipo for click ou genérico (omitido)
        if (!type || type === "click") {
          const data = {
            event: eventName || "interaction",
            category: category || "general",
            label: label || "",
            type: "click",
          };
          console.log("data =>", data);
          pushToDataLayer(data);
        }
      }
    };

    document.addEventListener("click", handleClick, true); // UseCapture para garantir captura
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [enabled]);
};
