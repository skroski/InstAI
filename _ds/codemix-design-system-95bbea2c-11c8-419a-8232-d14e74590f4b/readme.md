# Codemix Design System

Design system for **Codemix — Soluções Web** (previously *codemix . Soluções em Sistemas de Informação*), a Brazilian (Curitiba, +55 41) web software studio. Two eras of the brand are represented in the supplied material and both are honoured here:

1. **codemix.com.br — institucional/SaaS era.** A dark graphite site with an amber highlight bar selling "gerenciadores de conteúdo": *UtJuris* (rede social jurídica), *e:agency* (gestão para agências), *eumobilien* / *Mapa de Imóveis* (imóveis), *Adverall*.
2. **Codemix Soluções Web / AI era.** Flat charcoal campaign material: *"DESENVOLVO SEU PRODUTO COM AGENTES E AUTOMAÇÕES IA — UI/UX DESIGN . DESENVOLVIMENTO . SEO E GEO — TYPESCRIPT . N8N . SUPABASE"*. First-person, solo-operator voice; stack named explicitly.

**Portfólio atual (2026).** A Codemix opera hoje dois produtos próprios, cada um com identidade independente — as marcas dos produtos **não** herdam o charcoal+âmbar da Codemix:

- **Duplo D** — logotipo horizontal, paleta vinho/roxo/ardósia (`#ab2930`, `#441556`, `#647883`, `#43525a`). Arquivo: `assets/portfolio/logo-duplod.svg` — **só existe a versão para fundo claro**; o wordmark ardósia não tem contraste suficiente sobre fundo escuro. Falta a versão knockout.
- **VetBots** — logotipo com mascote, paleta teal profunda + cobre (`#032930`, `#0a4e5c`, `#298fa3`, `#70b4c2`, `#bf7b40`). Arquivos: `assets/portfolio/logo-vetbots-light-bg.svg` e `…-dark-bg.svg`.

A Codemix é a marca-mãe (studio); Duplo D e VetBots são as marcas de produto. Em material da Codemix que mostre o portfólio, use os logotipos dos produtos como estão — nunca recolorindo para âmbar.

The constant across both eras: **charcoal/graphite + the amber→orange splash mark**, geometric sans wordmark, lowercase navigation, and a very small palette.

## Sources given to me

| Source | What it is | Status |
| --- | --- | --- |
| pasted SVG (dark-background lockup) | **official vector logo**, 671×243, white wordmark + mark with `#FFCB05 → #F58220` gradient | used → `assets/logo-codemix-white.svg` — the canonical knockout mark |
| `uploads/logo-codemix.png` | logo, black on white, 745×745 | used → `assets/logo-codemix-dark.png`, `assets/logo-codemix-white.png` (bitmap fallback) |
| `uploads/logotipo_codemix.jpg` | full-colour lockup on white, 800×564 | used → `assets/logo-codemix-color.png`, `assets/mark-codemix-color.png` |
| `uploads/1.jpg` | 1584×396 campaign banner (AI era) | recreated in `ui_kits/brand-banner/` |
| `uploads/Screenshot 2023-07-25 at 14.13.11.png` | codemix.com.br home, 2228px wide | recreated in `ui_kits/codemix-web/` |
| `uploads/Screenshot 2023-08-03 at 08.37.38.png` | home, full column | idem |
| `uploads/Screenshot 2023-08-03 at 08.37.48.png` | página *contato* | idem |
| `uploads/Screenshot 2023-08-03 at 08.37.59.png` | página *produtos* | idem |
| `codemix.ai` | listed as an attachment; **no file arrived and the domain is not reachable from here** (`codemix.dev` resolves to an expired-domain parking page) | **not read** |

**No codebase and no Figma file were provided.** Everything visual below is measured off the images, which is lossier than source code — values are close, not authoritative. If a repository or Figma file exists, attach it and I will replace the estimated metrics with real ones.

## Index

- `styles.css` — the one file consumers link; nothing but `@import`s.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `motion.css`.
- `assets/portfolio/` — logotipos dos produtos (Duplo D, VetBots claro/escuro).
- `assets/` — logo lockups (colour / white / black), the mark alone, hero screenshot stack, product logo tiles cropped from the source captures.
- `guidelines/` — 20 specimen cards (Colors, Type, Spacing, Brand), incluindo o card de portfólio Duplo D / VetBots.
- `components/core/` — `Button`, `LinkArrow`, `Badge`, `Logo`, `SectionHeading`.
- `components/forms/` — `Field`, `Input`, `Textarea`, `Select`, `Checkbox`.
- `components/layout/` — `Panel`, `NavTabs`, `HighlightBar`.
- `components/content/` — `BulletList`, `ProductThumb`, `MediaLinkList`.
- `ui_kits/codemix-web/` — 3-page institutional site recreation (home, produtos, contato).
- `ui_kits/brand-banner/` — campaign banner recreation + square social variant.
- `SKILL.md` — Agent Skills wrapper.

### Intentional additions

No source defined a component inventory (screenshots and logo files only), so the set above is the standard primitive set *reduced* to what the sources actually show. `Logo`, `HighlightBar`, `MediaLinkList`, `ProductThumb` and `SectionHeading` are direct transcriptions of recurring source patterns rather than generic primitives. Nothing was added that has no counterpart in the material — no Toast, Avatar, Tabs, Modal, Tooltip.

## Content fundamentals

**Language.** Brazilian Portuguese, always. Technical English terms stay in English (*upload*, *design*, *SEO*, *n8n*, *TypeScript*).

**Person.** The institutional era speaks as *we*: "Vendemos soluções para problemas de organização…", "Temos a solução ideal para a sua empresa." The AI-era banner speaks as *I*: "**Desenvolvo** seu produto com agentes e automações IA." Both address the reader as **você / seu / sua**, never *tu*. Pick the era's voice and hold it for the whole piece; do not mix *desenvolvo* and *vendemos* in one artefact.

**Sentence shape.** Short, benefit-first, imperative. Lists start with a verb: "Atualize conteúdos de qualquer computador", "Insira fotos, vídeos, arquivos, músicas", "Confira os acessos, organize os usuários". Gerund triads are a signature: "Descomplicando a web, agilizando processos e satisfazendo clientes."

**Casing.**
- Navigation and sub-nav links: lowercase — `home · empresa · produtos · demonstrações · suporte · contato`.
- Buttons: lowercase — `saiba mais`, `enviar`.
- Eyebrows/kickers and campaign display type: UPPERCASE condensed — `CONHEÇA AS VANTAGENS`, `DESENVOLVO SEU PRODUTO COM`.
- Headings and body: sentence case. Never set a paragraph in caps.
- Product names keep their own casing: `UtJuris`, `e:agency`, `eumobilien`, `Adverall`.

**Punctuation quirks.** A spaced middle dot separates name and descriptor: `e:agency . design, publicidade e web.` / `Rede Social Jurídica . UtJuris` / `codemix . development solutions`, and it also joins service lists: `UI/UX DESIGN . DESENVOLVIMENTO . SEO E GEO`. Forward links close with a guillemet: `Consulte nossos planos »`. Ellipses trail open-ended lists: "loja virtual, agência, rede social…". Phone numbers are bracketed: `ligue [ 41 ] 3022 8263`.

**Tone.** Plain, practical, reassuring, no hype and no superlative stacking. The one boast the brand allows itself is "as ferramentas mais poderosas de gerenciamento de conteúdo na internet." Prices and plans are always one click away ("Consulte nossos planos"), never on the page.

**Emoji: never.** Not in UI, not in marketing copy. Unicode glyphs *are* used as functional marks: `»` for forward links, `▸` in the button arrow cap, `•` for bullets, `✉` before the e-mail address.

## Visual foundations

**Palette.** Two families and nothing else. The **official brand gradient is `#FFCB05 → #F58220`** (from the vector logo) and drives `--grad-brand`; the amber→orange scale (`#f6bc03 → #ee9c0a → #e98015`, sampled from the bitmap lockup) supplies the flat accent steps for one accent per view; graphite/charcoal (`#2b2b2b`, `#363d3f`, `#44494c`, `#4b5054`) for chrome and dark bands; a flat neutral ramp (`#fff → #808080`) for content. Semantic green/red/blue exist for status only and never as decoration. No purple, no blue-violet gradients, no secondary brand hue.

**Two-band layout.** Every institutional page is the same structure: graphite header (logo + phone) → graphite nav → full-bleed amber highlight strip → graphite hero band → light content band. Content lives in a 1004px container split 640px main / 288px aside with a 20px gap. The header, nav, amber bar and hero repeat on every page unchanged — they are chrome, not hero content.

**Type.** Display: heavy condensed uppercase (Oswald substituted) for campaign headlines and kickers, tracked ~0.05em, line-height ~1.02. Text: geometric sans (Jost substituted) matching the wordmark's circular `o`/`c`/`e`. The signature heading is **two-weight**: medium lead phrase + light continuation — *«**últimos** lançamentos»*, *«**cases** de sucesso»*, *«**Assine já** um dos nossos serviços…»*. Body 15–17px at 1.5. Mono (JetBrains Mono) for stack labels and code only.

**Backgrounds.** Vertical gradients everywhere in the institutional era: chrome `#404447 → #4a4f52`, amber bar `#f6bf04 → #e08c07`, light band `#c9c9c9 → #e6e6e6`. Over the graphite header sits a barely-visible bokeh-bubble texture (not supplied as a file; approximated with a soft radial highlight — see caveats). The AI era drops all of it for one flat `#2b2b2b` field. No photography anywhere in the sources; imagery is product screenshots (cool, blue-grey, slightly dark) and logo tiles on white.

**Logo files.** `assets/logo-codemix-white.svg` is the canonical lockup for dark backgrounds — use it, at any size, in preference to the bitmaps. The PNGs (`-color`, `-dark`, `-white`, `mark-`) are derived from the older raster files and remain for light-background and watermark use.

**The mark as watermark.** The splash symbol is used oversized, mono, bled off an edge at 5–6% white on charcoal. That is the only decorative graphic the brand uses. Never redraw or recolour it — always the bitmap from `assets/`.

**Radii.** 2px (badges/inline chips), 4px (buttons, nav tabs, thumbnails), 6px (panels), 10px (form fields — noticeably rounder than the buttons, deliberately), pill (badges only). Nothing fully squared, nothing softer than 10px.

**Cards / panels.** White fill, 1px `#dcdcdc` hairline, 6px radius, `0 1px 2px rgba(0,0,0,.10)` — flat and quiet. Panel headers get a faint top-down grey wash (`#f2f2f2 → #fbfbfb`) and the two-weight title with a small grey subtitle under it. Dark panels (inside the hero) are `rgba(255,255,255,.04)` over graphite with a 1px white-14% left border instead of a shadow.

**Buttons.** Amber gradient, 1px `#c96a0c` border, `inset 0 1px 0 rgba(255,255,255,.55)` top highlight plus `0 1px 2px rgba(0,0,0,.28)` drop — glossy, era-appropriate. White label with a 1px dark text-shadow. The primary button carries a **divided arrow cap** on the right: a 26px zone split by a 1px dark rule and a 1px white inner highlight, holding a small `▸`.

**Interaction.** Hover darkens rather than lightens: links `#ee9c0a → #c96a0c`; secondary buttons deepen their gradient; nav tabs lift from `#d7d8da` to white. Press = `inset 0 2px 4px rgba(0,0,0,.32)` (the control looks pushed in); no scale transforms. Focus = 3px amber glow `rgba(241,161,11,.32)`, never a browser-blue ring. Fields are white with `inset 0 1px 2px rgba(0,0,0,.12)`.

**Motion.** Minimal and short: 120/180/320ms with `cubic-bezier(.4,0,.2,1)`. Colour and shadow fades only — no bounce, no spring, no parallax, no scroll-triggered reveals. The era's only "animation" was Flash tutorials, which are content, not motion design.

**Transparency & blur.** Sparingly, and only over graphite: white at 4–14% for panel fills and hairlines, the mark watermark at ~6%. Blur is available (`--blur-glass`) but nothing in the sources uses it — prefer flat fills.

**Fixed elements.** None. The institutional site scrolls as one document; the chrome sits at the top and scrolls away.

## Iconography

There is **no icon library, icon font or SVG sprite** in the supplied material — the legacy site drew its glyphs as small bitmap sprites that were not provided, and the AI-era banner has no icons at all.

What the brand actually uses, in order of preference:

1. **Unicode glyphs as functional marks** — `»` (forward link), `▸` (button arrow cap), `•` (amber bullets), `✉` (before the e-mail address), `+` in a small amber circle ("Saiba mais" expanders), `▶` (video rows). These are reproduced verbatim in the components.
2. **Tiny uppercase type badges** instead of file-type icons — `JPG`, `SWF`, `DOC` in a 22px grey rounded square (`MediaLinkList`). This is what the source does.
3. **The splash mark** as the only pictorial element (`assets/mark-codemix-color.png`).
4. **Product logos as images** — cropped from the captures into `assets/produto-*.png`.

If a real icon set is needed for new work, use **Lucide** from CDN (`https://unpkg.com/lucide-static@0.544.0/icons/<name>.svg`) at 1.5–2px stroke, coloured `currentColor`. **This is a substitution, flagged for review** — it is not the brand's own set. Never hand-draw an approximation of a Codemix glyph, and never substitute emoji for icons.

## Substitutions to review (please confirm or replace)

- **Fonts.** No binaries supplied. **Oswald** stands in for the condensed display face and **Jost** for the geometric text face. Both load from Google Fonts in `tokens/fonts.css`.
- **Icons.** Lucide suggested as above; nothing from Lucide is currently used in components.
- **Header texture.** The bokeh-bubble pattern behind the graphite header is approximated with a soft radial gradient; the original bitmap was not available.
- **`codemix.ai`** was never readable — if that is the current site, the modern-era guidance here rests on the banner alone.
