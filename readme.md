Aqui está o conteúdo completo e definitivo para o seu arquivo `README.md`.

É só clicar no botão **"Copy"** no canto do bloco de código abaixo e colar no seu arquivo.

```markdown
# NineTwo User Tracking

Pacote de abstração de Analytics para React e Next.js.
Facilita a implementação do **Google Tag Manager (GTM)** utilizando **Delegação de Eventos** para cliques (via atributos HTML) e **Intersection Observer** para visualizações, eliminando a necessidade de funções manuais de `onClick` repetitivas.

## ✨ Funcionalidades

- 🚀 **Zero Boilerplate:** Rastreamento declarativo via atributos `data-nt-ut-*`.
- 🖱️ **Click Tracking Automático:** Listener global que captura cliques, inclusive em elementos aninhados.
- 👁️ **View Tracking:** Componente dedicado para eventos de visualização (scroll).
- 💉 **GTM Injection:** Injeção automática, segura e otimizada do script do GTM.
- ⚡ **Next.js Ready:** Compatível com App Router (Server Components) via padrão de Providers.

---

## 📦 Instalação

```bash
npm install ninetwo_user_tracking
# ou
yarn add ninetwo_user_tracking
# ou
pnpm add ninetwo_user_tracking

```

---

## 🚀 Configuração (Next.js 13+ App Router)

Para evitar erros de hidratação e garantir que o contexto funcione, utilize o padrão de **Providers**.

### 1. Crie o componente `app/providers.tsx`

```tsx
'use client';

import { TrackingProvider } from 'ninetwo_user_tracking';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TrackingProvider 
      gtmId="GTM-SEU-ID-AQUI" 
      debug={process.env.NODE_ENV === 'development'} // Mostra logs no console em dev
    >
      {children}
    </TrackingProvider>
  );
}

```

### 2. Envolva o `app/layout.tsx`

```tsx
import { Providers } from "./providers";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

```

---

## 🖱️ Rastreamento de Cliques

Basta adicionar os atributos `data-nt-ut-*` ao elemento interativo.
O script utiliza delegação de eventos, garantindo que cliques em filhos (ex: ícone dentro de botão) disparem o evento do pai corretamente.

```tsx
<button
  className="btn-primary"
  data-nt-ut-event="add_to_cart"
  data-nt-ut-category="ecommerce"
  data-nt-ut-label="tenis_nike_v2"
  data-nt-ut-type="click"
>
  <span>Comprar Agora</span>
</button>

```

### Tabela de Atributos

| Atributo | Obrigatório | Descrição | Exemplo |
| --- | --- | --- | --- |
| `data-nt-ut-event` | ✅ Sim | Nome do evento enviado ao GTM. | `"contact_start"` |
| `data-nt-ut-category` | ❌ Não | Categoria para relatórios. | `"header_menu"` |
| `data-nt-ut-label` | ❌ Não | Rótulo identificador do item. | `"btn_whatsapp"` |
| `data-nt-ut-type` | ❌ Não | Tipo da interação (Padrão: `"click"`). | `"click"`, `"cta"` |

---

## 👁️ Rastreamento de Visualização (View)

Use o componente `<TrackView>` para disparar um evento quando um elemento entrar na tela.

```tsx
import { TrackView } from 'ninetwo_user_tracking';

export default function BannerPromocional() {
  return (
    <TrackView 
      eventName="promotion_view" 
      category="home_banners" 
      label="summer_sale"
      threshold={0.5} // Dispara quando 50% do elemento estiver visível
    >
      <div className="banner">
        <h1>Oferta de Verão</h1>
      </div>
    </TrackView>
  );
}

```

---

## ⚙️ Integração com GTM e GA4

O pacote envia os dados para a camada de dados (`window.dataLayer`). Configure o GTM para ler esses dados.

### 1. O que é enviado ao DataLayer?

```javascript
{
  event: "nome_do_evento",
  event_category: "categoria_exemplo",
  event_label: "label_exemplo",
  event_type: "click",
  interaction_time: "2024-01-01T12:00:00Z"
}

```

### 2. Configuração no Google Tag Manager

1. **Variáveis (Data Layer Variables):**
* Crie variáveis para ler: `event_category`, `event_label`, `event_type`.


2. **Acionador (Trigger):**
* Tipo: *Evento Personalizado*.
* Nome do evento: Use Regex `.*` para pegar todos ou defina nomes específicos.


3. **Tag (GA4 Event):**
* Crie uma tag de evento do GA4.
* Em *Nome do Evento*, use a variável built-in `{{Event}}`.
* Em *Parâmetros do Evento*, mapeie as variáveis criadas no passo 1 (ex: `category` = `{{DLV - Category}}`).



---

## 🐛 Debugging

Para verificar se os eventos estão disparando:

1. Ative a prop `debug={true}` no `<TrackingProvider>`.
2. Abra o Console do navegador (F12).
3. Você verá logs com o prefixo `[NineTwo Tracking]`.
4. Também pode verificar o disparo na aba **Network** filtrando por `collect` (se o GA4 estiver configurado) ou digitando `dataLayer` no console.

---

## License

ISC © NineTwo

```

```