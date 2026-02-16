# Vecta Design System

Sistema de design extraído do projeto Vecta Design Studio.
Referência completa para reuso em outros projetos.

---

## 1. CSS Variables (Globais)

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border-top: rgba(255, 255, 255, 0.3);
  --glass-border-bottom: rgba(255, 255, 255, 0.05);
  --text-main: #f5f5f7;
  --nav-height: 60px;
}
```

---

## 2. Paleta de Cores

### 2.1 Primary (Azul)

| Token | Hex | Uso |
|-------|-----|-----|
| primary-50 | `#f0f9ff` | Background sutil |
| primary-100 | `#e0f2fe` | Background leve |
| primary-200 | `#bae6fd` | Borders leves |
| primary-300 | `#7dd3fc` | Texto secundário, links |
| primary-400 | `#38bdf8` | Destaques |
| primary-500 | `#0ea5e9` | Botões hover |
| primary-600 | `#0284c7` | **Cor principal de acento** |
| primary-700 | `#0369a1` | Botões pressed |
| primary-800 | `#075985` | Backgrounds densos |
| primary-900 | `#0c4a6e` | Backgrounds profundos |
| primary-950 | `#082f49` | Backgrounds mais escuros |

### 2.2 Neutrals

| Token | Hex | Uso |
|-------|-----|-----|
| neutral-50 | `#f8fafc` | Background mais claro |
| neutral-100 | `#f1f5f9` | Background claro |
| neutral-200 | `#e2e8f0` | Borders claros |
| neutral-300 | `#cbd5e1` | Texto disabled claro |
| neutral-400 | `#94a3b8` | Texto secundário (dark theme) |
| neutral-500 | `#64748b` | Texto muted |
| neutral-600 | `#475569` | Texto secundário (light theme) |
| neutral-700 | `#334155` | Texto body (light theme) |
| neutral-800 | `#1e293b` | Borders dark, backgrounds |
| neutral-900 | `#0f172a` | Background dark |
| neutral-950 | `#020617` | **Background base do site** |

### 2.3 Gradiente CTA

```css
background: linear-gradient(to right, #3dbff2, #020f59);
```

### 2.4 Paletas por Projeto

#### Chicafe (Tema Claro, Laranja)
```
Orange:       #E85D04  (primária)
Orange Light: #F48C06
Orange Dark:  #C14B03
Background:   #FFFFFF / neutral-50
```

#### Jonatas Oliveira (Tema Escuro, Dourado)
```
Gold:         #C9A84C  (primária)
Gold Light:   #E0C068
Gold Dark:    #A8893A
Background:   #000000 / #0A0A0A
```

#### ODDC (Tema Escuro Editorial, Indigo + Dourado)
```
Indigo:       #2D1B69  (primária)
Indigo Light: #4A2D8C
Indigo Dark:  #1A0F40
Gold:         #C9A84C  (acento)
Gold Light:   #E0C068
Background:   #000000 / #0A0A0A
Light accent: #F5F0E8
```

#### Renatta Campos (Tema Claro, Verde + Nude)
```
Green Moss:   #465802  (primária)
Dark Green:   #545844
Medium Green: #4f582e
Deep Green:   #4b5818
Nude/Sand:    #FFE1BD  (secundária)

Swatches laranjas: #ff9617, #ffb357, #ffd097, #ffe1bd
Swatches azuis:    #53a8f3, #168cf3, #b4d5f3, #77b9f3
```

#### iWorld Prime (Tema Escuro, Grayscale)
```
Black:      #1f1f1f  (primária)
Gray:       #777777  (secundária)
Off-White:  #e6e6e6  (terciária)
Ice Blue:   #deecf1  (acento)
Support:    #fcebd4, #f8d29d, #f6ca56
```

#### G7 Company (Tema Escuro, Azul Marinho)
```
White:      #FFFFFF  (primária)
Navy Blue:  #082484  (secundária)

Escala de azuis (8 tons):
#6AE3FF, #5CCBFF, #4CB5FF, #3C9EFF,
#2E87FF, #3A79FF, #105BFF, #0444FF
```

---

## 3. Tipografia

### 3.1 Font Stack Global

```css
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI',
             Roboto, Helvetica, Arial, sans-serif;
```

Google Font carregada: `Inter` (weights: 300, 400, 500, 600, 700)

### 3.2 Fontes por Projeto

| Fonte | Projeto | Formato | Pesos |
|-------|---------|---------|-------|
| Cinema Sunday | Renatta Campos (titulos) | WOFF2/WOFF | Regular |
| Work Sans | Renatta Campos (textos) | TTF | 400, 500, 600, 700 |
| Avenir Next LT Pro | iWorld Prime | OTF | 400, 500, 600, 700 |
| Mangueira Alt | G7 Company | OTF | 400, 700, 900 |

### 3.3 Hierarquia Tipografica

| Elemento | Mobile | Desktop | Weight | Line-height |
|----------|--------|---------|--------|-------------|
| Hero H1 | `text-4xl` (36px) | `text-7xl` (56px) | `font-black` (900) | `leading-[0.95]` |
| Hero H1 (alt) | `text-4xl` (36px) | `text-5xl` (48px) | `font-bold` (700) | `leading-tight` |
| Section H2 | `text-3xl` (30px) | `text-4xl` (36px) | `font-bold` (700) | default |
| Subsection H3 | `text-xl` (20px) | `text-2xl` (24px) | `font-semibold` (600) | default |
| Body Large | `text-lg` (18px) | `text-xl` (20px) | `font-normal` (400) | `leading-relaxed` (1.625) |
| Body | `text-base` (16px) | `text-base` (16px) | `font-normal` (400) | `leading-relaxed` (1.625) |
| Small | `text-sm` (14px) | `text-sm` (14px) | `font-medium` (500) | default |
| Label/Tag | `text-xs` (12px) | `text-xs` (12px) | `font-semibold` (600) | `tracking-wider`, `uppercase` |

### 3.4 Cores de Texto

| Contexto | Heading | Body | Secondary | Muted |
|----------|---------|------|-----------|-------|
| Dark theme | `text-white` | `text-neutral-300` | `text-neutral-400` | `text-neutral-500` |
| Light theme | `text-neutral-900` | `text-neutral-700` | `text-neutral-600` | `text-neutral-500` |

---

## 4. Espacamento

### 4.1 Padding de Secao

| Classe | Valor | Uso |
|--------|-------|-----|
| `py-12` | 48px | Secao compacta |
| `py-16` | 64px | Secao padrao |
| `py-20` | 80px | Secao media |
| `py-24` | 96px | Secao grande |
| `py-32` | 128px | **Secao hero / destaque** |

### 4.2 Padding Horizontal (Responsivo)

```
Mobile:  px-4  (16px)
Tablet:  sm:px-6  (24px)
Desktop: lg:px-8  (32px)
```

### 4.3 Gap (Grid/Flex)

| Classe | Valor | Uso |
|--------|-------|-----|
| `gap-2` | 8px | Botoes/badges inline |
| `gap-3` | 12px | Carrossel items |
| `gap-4` | 16px | Grid padrao |
| `gap-6` | 24px | Grid medio |
| `gap-8` | 32px | Grid grande |
| `gap-12` | 48px | Colunas de conteudo |
| `gap-16` | 64px | Colunas largas |
| `gap-24` | 96px | Colunas extra largas (desktop) |

### 4.4 Max-Width Containers

| Classe | Valor | Uso |
|--------|-------|-----|
| `max-w-7xl` | 1280px | Container padrao de pagina |
| `max-w-5xl` | 896px | Container de conteudo focado |
| `max-w-4xl` | 832px | Imagens key visual |
| `max-w-3xl` | 768px | Texto longo |
| `max-w-2xl` | 672px | Texto estreito / glass boxes |
| `max-w-md` | 448px | Glass box compacto |

---

## 5. Border Radius

| Classe | Valor | Uso |
|--------|-------|-----|
| `rounded-full` | 9999px | Botoes, navbar, pills, badges |
| `rounded-3xl` | 24px | Containers grandes, modais mobile |
| `rounded-2xl` | 16px | **Cards padrao**, glass boxes, imagens hero |
| `rounded-xl` | 12px | Imagens de galeria, carrossel items |
| `rounded-lg` | 8px | Elementos menores |

---

## 6. Sombras

### 6.1 Sombras Padrao

```css
/* Leve */
shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05)

/* Padrao */
shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)

/* Grande */
shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)

/* Extra grande */
shadow-2xl: 0 25px 50px -12px rgba(0,0,0,0.25)
```

### 6.2 Sombras Custom

```css
/* Glow do botao primario (hover) */
box-shadow: 0 0 20px rgba(2, 132, 199, 0.5);

/* Glow do card portfolio (hover) */
box-shadow: 0 0 30px rgba(14, 165, 233, 0.15);

/* Glass box (light theme) */
box-shadow:
  inset 0 1px 0 0 rgba(255,255,255,0.4),
  inset 0 -1px 0 0 rgba(255,255,255,0.1),
  0 10px 40px -10px rgba(0,0,0,0.2);

/* Glass box (dark theme) */
box-shadow:
  inset 0 1px 0 0 rgba(255,255,255,0.1),
  inset 0 -1px 0 0 rgba(255,255,255,0.03),
  0 10px 40px -10px rgba(0,0,0,0.5);

/* Liquid glass (navbar) */
box-shadow:
  inset 0 0 0 1px rgba(255,255,255,0.05),
  inset 0 1px 0 0 var(--glass-border-top),
  inset 0 -1px 0 0 var(--glass-border-bottom),
  0 10px 40px -10px rgba(0,0,0,0.5);
```

---

## 7. Liquid Glass (Efeito Vidro)

### 7.1 Classe Global `.liquid-glass`

Usada no navbar e componentes sobre fundo escuro. Funciona com pseudo-elements (`::before`, `::after`) e z-index negativo.

```css
.liquid-glass {
  position: relative;
  background-color: var(--glass-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 0 var(--glass-border-top),
    inset 0 -1px 0 0 var(--glass-border-bottom),
    0 10px 40px -10px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* Distorcao nas bordas */
.liquid-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -2;
  backdrop-filter: blur(30px) saturate(200%);
  mask-image: radial-gradient(ellipse at center, transparent 40%, black 95%);
  border-radius: inherit;
  pointer-events: none;
}

/* Substancia (centro) */
.liquid-glass::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -3;
  backdrop-filter: blur(10px) saturate(120%);
  border-radius: inherit;
  pointer-events: none;
}
```

### 7.2 Glass Box Inline (Light Theme)

Usado quando a classe `.liquid-glass` nao funciona (z-index conflita com contexto de stacking).

```jsx
<div className="relative rounded-2xl p-8 sm:p-10 overflow-hidden"
  style={{
    border: '1px solid rgba(255,255,255,0.3)',
    boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.4), inset 0 -1px 0 0 rgba(255,255,255,0.1), 0 10px 40px -10px rgba(0,0,0,0.2)',
  }}
>
  {/* Camada de desfoque */}
  <div className="absolute inset-0 -z-10"
    style={{
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      backgroundColor: 'rgba(255,255,255,0.72)',
    }}
  />
  {/* Camada de distorcao nas bordas */}
  <div className="absolute inset-0 -z-10"
    style={{
      backdropFilter: 'blur(50px) saturate(200%)',
      WebkitBackdropFilter: 'blur(50px) saturate(200%)',
      maskImage: 'radial-gradient(ellipse at center, transparent 40%, black 95%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 40%, black 95%)',
      borderRadius: 'inherit',
    }}
  />
  {/* Conteudo */}
</div>
```

### 7.3 Glass Box Inline (Dark Theme)

```jsx
/* Mesma estrutura, troque o backgroundColor da camada de desfoque: */
backgroundColor: 'rgba(0,0,0,0.75)'

/* E ajuste as borders: */
border: '1px solid rgba(255,255,255,0.08)'
```

### 7.4 Mobile Glass Menu

```css
.mobile-glass-menu {
  background: rgba(10, 10, 10, 0.4);
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

---

## 8. Componentes Reutilizaveis

### 8.1 Button

```tsx
// Variants: 'primary' | 'secondary' | 'outline'
// Sizes: 'sm' | 'md' | 'lg'

const baseStyles = "inline-flex items-center justify-center border font-medium
  rounded-full transition-all duration-200 focus:outline-none focus:ring-2
  focus:ring-offset-2";

const sizes = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

const variants = {
  primary:   "border-transparent text-white bg-primary-600
              hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(2,132,199,0.5)]
              focus:ring-primary-500",
  secondary: "border-transparent text-primary-300 bg-primary-900/30
              hover:bg-primary-900/50 focus:ring-primary-500",
  outline:   "border-neutral-700 text-neutral-200 bg-transparent
              hover:bg-neutral-800 hover:text-white hover:border-neutral-500
              focus:ring-neutral-500",
};
```

### 8.2 CTA Button (Hero)

```jsx
<button className="bg-gradient-to-r from-[#3dbff2] to-[#020f59]
  text-white px-7 py-3 rounded-full font-semibold
  shadow-lg hover:shadow-xl hover:opacity-90 hover:scale-105
  transition-all duration-300">
  Texto do CTA
</button>
```

### 8.3 Case Nav Button (Voltar)

```jsx
<button className="text-sm py-2 px-6 rounded-full font-medium flex items-center
  transition-colors"
  style={{
    border: '1.5px solid rgba(255,255,255,0.3)',
    color: '#fff',
    background: 'transparent',
  }}
  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
>
  <ArrowLeft className="mr-2 w-4 h-4" />
  Voltar ao Portfolio
</button>
```

### 8.4 Card de Portfolio

```jsx
<div className="group cursor-pointer rounded-2xl overflow-hidden border border-neutral-800
  hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] hover:scale-[1.03]
  transition-all duration-500">
  <div className="relative aspect-[3/4] overflow-hidden">
    <img className="w-full h-full object-cover transition-transform duration-700" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <h3 className="text-xl font-bold text-white mb-1">Titulo</h3>
      <p className="text-neutral-400 text-sm">Subtitulo</p>
    </div>
  </div>
</div>
```

### 8.5 Service Card

```jsx
<div className="liquid-glass rounded-2xl p-6 border border-neutral-800
  hover:border-primary-500/50 hover:shadow-[0_0px_30px_rgba(14,165,233,0.15)]
  hover:-translate-y-2 transition-all duration-300 group">
  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-5
    group-hover:bg-primary-500/20 transition-colors">
    <Icon className="w-6 h-6 text-primary-400" />
  </div>
  <h3 className="text-xl font-semibold text-white mb-3">Titulo</h3>
  <p className="text-neutral-400 leading-relaxed text-sm">Descricao</p>
</div>
```

### 8.6 Badge / Tag

```jsx
{/* Label de secao (uppercase) */}
<span className="text-xs font-semibold uppercase tracking-wider mb-3 block"
  style={{ color: corPrimaria }}>
  Nome da secao
</span>

{/* Tag pill */}
<span className="text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full"
  style={{ border: `1px solid ${cor}60`, color: cor }}>
  Tag
</span>

{/* Tag solida */}
<span className="text-xs font-medium px-3 py-1 rounded-full"
  style={{ backgroundColor: `${cor}20`, color: cor }}>
  Tag
</span>
```

### 8.7 Lightbox

```jsx
{lightbox && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center
    bg-black/90 backdrop-blur-sm"
    onClick={closeLightbox}>
    <button className="absolute top-6 right-6 z-10 p-2 rounded-full
      bg-white/10 hover:bg-white/20 text-white transition-colors"
      onClick={closeLightbox}>
      <X className="w-6 h-6" />
    </button>
    <img src={lightbox.src} alt={lightbox.alt}
      className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()} />
  </div>
)}
```

**Logica necessaria:**
```tsx
const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
const openLightbox = useCallback((src: string, alt: string) => setLightbox({ src, alt }), []);
const closeLightbox = useCallback(() => setLightbox(null), []);

// Escape + scroll lock
useEffect(() => {
  if (!lightbox) return;
  document.body.style.overflow = 'hidden';
  const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
  window.addEventListener('keydown', handleKey);
  return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKey); };
}, [lightbox, closeLightbox]);
```

### 8.8 Scroll Indicator

```jsx
<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-300"
  style={{ opacity: Math.max(0, 1 - scrollY / 150) }}>
  <div className="w-5 h-8 border-2 border-white/40 rounded-full flex justify-center pt-1.5">
    <div className="w-1 h-2 rounded-full animate-bounce bg-white/60" />
  </div>
</div>
```

---

## 9. Breakpoints Responsivos

### 9.1 Breakpoints Tailwind

| Prefixo | Largura | Dispositivo |
|---------|---------|-------------|
| (base) | 0px | Mobile |
| `sm:` | 640px | Tablet portrait |
| `md:` | 768px | Tablet landscape |
| `lg:` | 1024px | Desktop |

### 9.2 Padroes Responsivos

```
/* Navbar */
Mobile:  Hamburger menu (md:hidden)
Desktop: Links inline (hidden md:flex)

/* Grids */
Mobile:  grid-cols-1
Tablet:  sm:grid-cols-2 ou sm:grid-cols-3
Desktop: lg:grid-cols-3 ou lg:grid-cols-4

/* Tipografia */
H1: text-4xl -> sm:text-5xl -> sm:text-7xl
H2: text-3xl -> sm:text-4xl

/* Carrosseis */
Mobile:  Scroll infinito (sm:hidden)
Desktop: Grid estatico (hidden sm:grid)

/* Imagem responsiva */
<picture>
  <source media="(max-width: 767px)" srcSet="/path/cover-mobile.png" />
  <img src="/path/cover-desktop.png" />
</picture>

/* Tamanhos padrao de cover */
Desktop: 1920 x 1080 (16:9)
Mobile:  1080 x 1920 (9:16)
```

---

## 10. Animacoes e Transicoes

### 10.1 Reveal (Scroll Animations)

Componente `<Reveal>` com IntersectionObserver (`threshold: 0.1`).

| Variant | Efeito | Duration | Easing |
|---------|--------|----------|--------|
| `fade-up` | Opacity 0 + translateY(30px) -> normal | 0.8s | cubic-bezier(0.2, 0.8, 0.2, 1) |
| `blur-in` | Opacity 0 + blur(8px) + scale(0.98) -> normal | 1.0s | cubic-bezier(0.25, 0.46, 0.45, 0.94) |
| `elastic-up` | Opacity 0 + translateY(50px) -> bounce -> normal | 1.0s | cubic-bezier(0.34, 1.3, 0.64, 1) |
| `zoom-in` | Opacity 0 + scale(0.95) -> normal | 0.6s | cubic-bezier(0.2, 0.8, 0.2, 1) |
| `fade-right` | Opacity 0 + translateX(30px) -> normal | 0.8s | cubic-bezier(0.2, 0.8, 0.2, 1) |
| `fade-left` | Opacity 0 + translateX(-30px) -> normal | 0.8s | cubic-bezier(0.2, 0.8, 0.2, 1) |

**Uso:**
```jsx
<Reveal variant="fade-up" delay={200}>
  <h2>Conteudo animado</h2>
</Reveal>
```

### 10.2 Keyframes Globais

```css
/* Blob decorativo flutuante */
@keyframes floatBlob {
  0%   { transform: translate(0px, 0px) scale(1); }
  33%  { transform: translate(30px, -50px) scale(1.1); }
  66%  { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes rotateBlob {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Carrossel infinito */
@keyframes scroll-left {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes scroll-right {
  0%   { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
```

### 10.3 Transicoes Padrao

| Classe | Duracao | Uso |
|--------|---------|-----|
| `duration-200` | 200ms | Interacoes rapidas (botoes, toggles) |
| `duration-300` | 300ms | **Padrao geral** (hover, borders) |
| `duration-500` | 500ms | Hover de imagens, scale |
| `duration-700` | 700ms | Slide de carrossel |
| `duration-1000` | 1000ms | Animacoes lentas |

### 10.4 Hover Effects

```css
/* Card scale */
hover:scale-[1.03]   /* Card de portfolio */
hover:scale-105      /* Imagens de galeria */

/* Elevacao */
hover:-translate-y-2  /* Service cards */

/* Glow */
hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]  /* Cards */
hover:shadow-[0_0_20px_rgba(2,132,199,0.5)]    /* Botoes */

/* Opacidade */
hover:opacity-90      /* CTA button */
hover:bg-white/20     /* Glass elements */
```

---

## 11. Carrossel Patterns

### 11.1 Banner Rotativo (Autoplay + Setas + Dots)

```jsx
const [index, setIndex] = useState(0);
const items = [{ src: '...', alt: '...' }, ...];

// Autoplay
useEffect(() => {
  const timer = setInterval(() => setIndex((prev) => (prev + 1) % items.length), 4000);
  return () => clearInterval(timer);
}, [items.length]);

// Viewport
<div className="relative">
  <div className="overflow-hidden rounded-xl">
    <div className="flex transition-transform duration-700 ease-in-out"
      style={{ transform: `translateX(-${index * 100}%)` }}>
      {items.map((item) => (
        <div key={item.src} className="w-full flex-shrink-0 cursor-pointer">
          <img src={item.src} alt={item.alt} className="w-full h-auto object-cover" />
        </div>
      ))}
    </div>
  </div>

  {/* Setas */}
  <button onClick={prev}
    className="absolute top-1/2 left-3 -translate-y-1/2 z-10 p-2 rounded-full
      bg-black/50 text-white hover:bg-black/80 transition-colors">
    <ChevronLeft className="w-5 h-5" />
  </button>
  <button onClick={next}
    className="absolute top-1/2 right-3 -translate-y-1/2 z-10 p-2 rounded-full
      bg-black/50 text-white hover:bg-black/80 transition-colors">
    <ChevronRight className="w-5 h-5" />
  </button>

  {/* Dots */}
  <div className="flex justify-center gap-2 mt-4">
    {items.map((_, idx) => (
      <button key={idx} onClick={() => setIndex(idx)}
        className="h-2.5 rounded-full transition-all duration-300"
        style={{
          backgroundColor: idx === index ? corPrimaria : '#ccc',
          width: idx === index ? '2rem' : '0.625rem',
        }} />
    ))}
  </div>
</div>
```

### 11.2 Carrossel Infinito (Mobile Netflix-style)

```jsx
{/* Container sangra nas bordas: -mx-4 */}
<div className="sm:hidden flex flex-col gap-8 -mx-4">
  <div>
    <span className="text-xs font-semibold uppercase tracking-wider mb-3 block px-4"
      style={{ color: corPrimaria }}>Feed</span>
    <div className="overflow-hidden">
      <div className="flex gap-3 pl-4"
        style={{ animation: 'scroll-left 60s linear infinite', width: 'max-content' }}>
        {/* Items duplicados para loop: [...items, ...items] */}
        {[...items, ...items].map((item, i) => (
          <div key={i} className="w-36 flex-shrink-0 rounded-xl overflow-hidden aspect-[3/4]">
            <img src={item.src} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  </div>
</div>

<style>{`
  @keyframes scroll-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes scroll-right {
    0% { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
`}</style>
```

**Velocidades:** Feed = 60s, Stories = 70s

---

## 12. Aspect Ratios

| Classe | Ratio | Uso |
|--------|-------|-----|
| `aspect-video` | 16:9 | Banners YouTube, videos |
| `aspect-[3/4]` | 3:4 | Feed Instagram, cards portfolio |
| `aspect-[9/16]` | 9:16 | Stories Instagram, banners mobile |
| `aspect-square` | 1:1 | Capas de album, swatches de cor |
| `aspect-[4/3]` | 4:3 | Fotos classicas |
| `aspect-[205/78]` | ~2.6:1 | Capa Facebook |

---

## 13. Z-Index Scale

| Valor | Uso |
|-------|-----|
| `z-[100]` | Lightbox / modais fullscreen |
| `z-50` | Navbar fixo |
| `z-40` | Overlay do menu mobile |
| `z-10` | Conteudo relativo sobre imagens |
| `z-0` | Default |
| `-z-10` | Camadas de glass backdrop |

---

## 14. Parallax

```tsx
const [scrollY, setScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => setScrollY(window.scrollY);
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Imagem hero (30% da velocidade do scroll)
<img style={{
  position: 'absolute',
  top: 0,
  transform: `translateY(${scrollY * 0.3}px)`,
  willChange: 'transform',
}} />

// Circulos decorativos (velocidades sutis)
<div style={{
  transform: `translateY(${scrollY * 0.06}px) scale(${1 + scrollY * 0.0001})`,
}} />

// Fade do scroll indicator
<div style={{ opacity: Math.max(0, 1 - scrollY / 150) }} />
```

---

## 15. Icones

Biblioteca: **Lucide React** (`lucide-react`)

Icones utilizados no projeto:
- `ArrowLeft` - Navegacao voltar
- `ArrowRight` - Links, CTAs
- `X` - Fechar lightbox/modal
- `Check` - Checklists, deliverables
- `ChevronLeft` / `ChevronRight` - Setas de carrossel
- `Monitor` - Servico webdesign
- `PenTool` - Servico identidade visual
- `Smartphone` - Servico direcao de arte
- `Star` - Avaliacoes/testimonials
- `Menu` - Hamburger menu
- `ExternalLink` - Links externos

---

## 16. Estrutura de Case Page

Template padrao para paginas de case study:

```
1. Nav fixo (cor do projeto + pill button voltar)
2. Hero (fullscreen, parallax, <picture> responsive)
3. Titulo + subtitulo (ou glass box sobre imagem)
4. Contexto PT/EN (grid 2 colunas)
5. Conceito / Direcao visual (tags, keywords)
6. Sistema visual (cores, tipografia, elementos)
7. Aplicacoes (grid de imagens com lightbox)
8. Redes sociais (grid desktop + carrossel mobile)
9. Banners rotativos (YouTube, Facebook)
10. Impacto / Resultado + CTA
11. Galeria final
12. Footer com CTA
13. Lightbox overlay
```

**Navbar do case:**
```jsx
<nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md py-4"
  style={{ backgroundColor: `${corPrimaria}f0`, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
```
