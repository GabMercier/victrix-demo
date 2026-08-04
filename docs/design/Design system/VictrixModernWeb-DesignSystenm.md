---
name: Victrix modern web
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0edea'
  surface-container-high: '#ebe8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#444656'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#747688'
  outline-variant: '#c4c5d9'
  surface-tint: '#1e47f4'
  primary: '#002fc7'
  on-primary: '#ffffff'
  primary-container: '#1d46f3'
  on-primary-container: '#d0d5ff'
  inverse-primary: '#bac3ff'
  secondary: '#515d82'
  on-secondary: '#ffffff'
  secondary-container: '#c6d3fe'
  on-secondary-container: '#4e5b7f'
  tertiary: '#424648'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a5e60'
  on-tertiary-container: '#d4d7d9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee0ff'
  primary-fixed-dim: '#bac3ff'
  on-primary-fixed: '#00105b'
  on-primary-fixed-variant: '#002fc8'
  secondary-fixed: '#dae2ff'
  secondary-fixed-dim: '#b9c6ef'
  on-secondary-fixed: '#0c1a3b'
  on-secondary-fixed-variant: '#394669'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#181c1e'
  on-tertiary-fixed-variant: '#434749'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  button:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-x: 32px
  section-gap: 80px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system embodies a **Corporate Modern** aesthetic tailored for high-trust IT consulting. It prioritizes clarity, authority, and technological precision. The visual narrative centers on a "Professional Intelligence" theme, utilizing a clean, white-dominant canvas punctuated by a commanding primary blue.

Key characteristics include:
- **High-Trust Professionalism:** Use of structured grids and ample white space to convey stability.
- **Modern Efficiency:** Sharp execution of UI elements with purposeful, understated transitions.
- **Data-Driven Clarity:** Heavy emphasis on typographic hierarchy to ensure complex technical services are easily digestible.

## Colors
The palette is rooted in a "Confidence Blue" that signifies expertise and reliability. 

- **Primary (#1D46F3):** A bright, electric corporate blue used for primary actions, text accents, and key brand elements. It provides a more modern, high-energy digital feel than traditional navies.
- **Secondary (#000D2E):** An ultra-deep midnight blue used for card backgrounds, footers, and high-contrast sections to provide structural depth.
- **Neutral (#1D1D1B):** The primary ink color for body text and headings, ensuring maximum legibility.
- **Surface (#F4F7F9):** A soft, cool gray used for section backgrounds and secondary containers to distinguish content areas from the pure white base.

## Typography
The system utilizes **Hanken Grotesk** to bridge the gap between traditional corporate sans-serifs and modern technical fonts. It offers a sharp, contemporary feel that remains highly readable.

- **Headlines:** Use Bold and Extra Bold weights. Tight letter spacing for display sizes creates a compact, impactful look.
- **Accents:** Use Primary Blue (#1D46F3) for specific keywords within headlines to guide attention.
- **Labels:** Small caps with increased letter spacing are used for category tags and metadata to provide a distinct stylistic break from body copy.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width to maintain readability on ultra-wide displays. 

- **Grid:** A 12-column grid is used for desktop. 
- **Rhythm:** An 8px base unit drives all spacing. 
- **Sectioning:** Large vertical gaps (80px - 120px) are utilized between major content blocks to create a premium, unhurried browsing experience.
- **Mobile Adaptivity:** Margins reduce to 16px on mobile, and the 12-column grid collapses to a single-column stack.

## Elevation & Depth
This design system avoids heavy shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Surfaces:** Use subtle background shifts (White to Light Gray) to define hierarchy rather than physical elevation.
- **Borders:** Use 1px solid borders in light gray (#E0E0E0) for cards and input fields to maintain a crisp, flat aesthetic.
- **Hover States:** Subtle "lift" can be achieved through a very soft, high-diffusion shadow (0px 4px 20px, 5% opacity) or a slight color shift in the background.

## Shapes
The shape language is **Soft** but disciplined. 

- **Primary Radius:** A 4px (0.25rem) radius is applied to buttons and small components to take the edge off without losing the professional "sharpness."
- **Large Components:** Cards and major containers may use up to 8px (0.5rem) to feel more approachable.
- **Imagery:** Hero images and thumbnails should maintain the standard 4px radius to align with the UI components.

## Components
- **Buttons:** Rectangular with a 4px radius. Primary buttons use the brand blue (#1D46F3) with white text. Secondary buttons use a transparent background with a 1px primary blue border or a solid light gray background.
- **Cards:** White background with a 1px light gray border. Use "Label-Caps" for categories at the top. For service cards, utilize full-bleed imagery with a navy (#000D2E) overlay for text legibility.
- **Inputs:** Clean, outlined boxes with 4px radius. Labels sit above the field in "Body-MD" bold.
- **Chips/Tags:** Small, pill-shaped or slightly rounded containers with light gray backgrounds and dark text, used for filtering or skill sets.
- **Iconography:** Use linear, medium-weight icons. Icons should be monochrome (Primary Blue or Navy) to maintain a cohesive, non-distracting look.