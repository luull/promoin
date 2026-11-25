Mobile E-Commerce UI Design System (style.md)

This document outlines the visual design system, color palette, typography, spacing, and component specifications derived from the reference mobile e-commerce UI.

1. Design Philosophy & Aesthetic

Style: Clean, modern, soft-minimalist mobile commerce UI.

Visual Hierarchy: High contrast for primary actions and product pricing, supported by soft cool-gray/ice-blue containers to group information without heavy borders.

Tactility: Generous border radii (pill-shaped buttons and rounded cards) combined with subtle surface elevation and clean outlines for active states.

2. Color Palette

Brand & Accent Colors

Token Name

Hex

RGB

Usage

color-primary

#2E69C6

rgb(46, 105, 198)

Primary CTA buttons ("Add to Cart", "Checkout"), active navigation icons, active selection borders, brand links ("Apple", "See All").

color-primary-dark

#1E4B94

rgb(30, 75, 148)

Hero banner gradient base, hover/pressed states for primary actions.

color-primary-light

#EBF2FC

rgb(235, 242, 252)

Subtle tint for active states, icon container backgrounds ("More" icon).

color-star-rating

#F5A623

rgb(245, 166, 35)

Star rating icons (4.9).

Neutral & Surface Colors

Token Name

Hex

RGB

Usage

bg-screen

#F5F7FB

rgb(245, 247, 251)

Main application screen background (soft cool off-white/ice tint).

bg-surface

#FFFFFF

rgb(255, 255, 255)

Product cards, category tiles, search bar, circular header action buttons, bottom navigation bar.

bg-surface-alt

#EAEFF7

rgb(234, 239, 247)

Bottom checkout summary sheet container in Cart view.

border-subtle

#E2E8F0

rgb(226, 232, 240)

Unselected option pills, quantity stepper borders, subtle dividers.

Typography Colors

Token Name

Hex

RGB

Usage

text-primary

#111827

rgb(17, 24, 39)

Section headings, product titles, final prices, bold totals.

text-secondary

#4B5563

rgb(75, 85, 99)

Feature descriptions, option labels, subtotal/tax labels.

text-muted

#9CA3AF

rgb(156, 163, 175)

Strikethrough original prices ($1499.99), search placeholder, unselected tab labels, review counts.

text-on-primary

#FFFFFF

rgb(255, 255, 255)

Text inside primary blue buttons and promotional hero banners.

3. Typography

Font Family: Sans-serif geometric/humanist UI font (e.g., Inter, Plus Jakarta Sans, or SF Pro Display).

Tabular Numbers: Use font-variant-numeric: tabular-nums for all pricing, quantities, and ratings to maintain alignment.

Role

Size

Weight

Line Height

Letter Spacing

Example

Screen Title

18px

600 (SemiBold)

24px

-0.01em

Cart

Product Title (PDP)

20px

700 (Bold)

28px

-0.02em

Iphone 16 Pro Max

Section Heading

16px

700 (Bold)

22px

-0.01em

Categories, Flash Deals for You

Hero Price

20px

700 (Bold)

26px

-0.01em

$1399.99

Card Title

14px

600 (SemiBold)

20px

0em

Smartwatch Ultra

Body / Spec Text

13px

400 (Regular)

18px

0em

4K Ultra HD XDR Display

Button Text

14px

600 (SemiBold)

20px

0em

Add to Cart, Checkout

Caption / Label

12px

500 (Medium)

16px

0em

Mobile, Color: Natural Titanium

Micro / Nav Label

10px

500 (Medium)

14px

0.01em

Home, Wishlist, Profile

4. Layout, Spacing & Elevation

Grid & Margins

Screen Padding (Horizontal): 16px (1rem) on left and right edges.

Section Vertical Gap: 20px – 24px between major sections.

Card Grid Gap: 12px between category tiles and product cards.

Border Radii

Pill Buttons & Search Bar: 9999px (Full pill radius).

Product & Category Cards: 16px (1rem).

Hero Banner: 20px (1.25rem).

Product Thumbnail Selectors: 10px (0.625rem).

Bottom Sheet / Checkout Panel: 24px top-left and top-right corners.

Shadows & Elevation

Card Elevation (shadow-card): 0px 4px 16px rgba(17, 24, 39, 0.04) — Ultra-soft ambient shadow to separate white cards from the #F5F7FB background.

Floating Action / Bottom Bar (shadow-float): 0px -4px 20px rgba(17, 24, 39, 0.06) — Used for sticky bottom CTA bars and tab navigation.

5. Component Specifications

5.1. Top Header & Search

Circular Icon Buttons: 38px × 38px circle, #FFFFFF background, 1.5px stroke icons (#111827).

Search Input: Height 42px, pill-shaped (border-radius: 9999px), #FFFFFF background, left search icon + right camera visual-search icon (#6B7280).

Cart Badge: 14px × 14px circle in #2E69C6 with 9px bold white counter text positioned top-right of the cart icon.

5.2. Hero Promo Banner

Dimensions: Full width (minus screen margins), height 140px, border-radius: 20px.

Background: Diagonal linear gradient (135deg, #27519E 0%, #5B8BE0 60%, #D99BBE 100%).

CTA inside Banner: Small white pill button (#FFFFFF), dark text (#111827), 11px SemiBold, padding 6px 14px.

Pagination Dots: Bottom center; active dot is 14px × 5px pill (#FFFFFF), inactive dots are 5px × 5px circles (rgba(255,255,255,0.45)).

5.3. Category Grid

Layout: 3-column grid (grid-template-columns: repeat(3, 1fr)), gap 12px.

Tile: #FFFFFF surface, border-radius: 16px, padding 14px 8px, centered product image (44px × 44px) above 12px Medium label.

5.4. Product Detail Page (PDP) Controls

Image Variant Thumbnails: 52px × 52px rounded squares (border-radius: 10px).

Unselected: #FFFFFF background, 1px solid #E2E8F0.

Selected: #FFFFFF background, 1.5px solid #2E69C6.

Color Selector Pills: Pill-shaped (border-radius: 9999px), padding 6px 14px 6px 6px, contains a 22px circular color swatch on the left + text label.

Selected State: 1.5px solid #2E69C6 border.

Storage Selector Pills: Pill-shaped, padding: 8px 20px.

Selected State: 1.5px solid #2E69C6 border, #2E69C6 SemiBold text.

Unselected State: 1px solid #E2E8F0 border, #4B5563 Regular text.

Quantity Stepper:

Minus button: 28px × 28px circle, 1px solid #E2E8F0, #4B5563 icon.

Counter: 28px width, centered 14px SemiBold text.

Plus button: 28px × 28px circle, 1.5px solid #2E69C6, #2E69C6 icon.

5.5. Buttons (CTAs)

Primary Button (Add to Cart, Checkout):

Background: #2E69C6

Text: #FFFFFF, 14px SemiBold

Height: 48px

Border Radius: 9999px (Pill)

Secondary Button (Buy Now):

Background: rgba(255, 255, 255, 0.85) with subtle backdrop blur

Border: 1.5px solid #2E69C6

Text: #2E69C6, 14px SemiBold

Height: 48px

Border Radius: 9999px (Pill)

5.6. Cart Line Item & Checkout Summary

Cart Item Card: #FFFFFF background, border-radius: 16px, padding 12px. Displays 72px × 72px product image on left, product metadata + price on right, and a bottom action row with Edit link (#2E69C6), quantity stepper, and trash icon (#9CA3AF).

Promo Code Input: Pill-shaped container (#FFFFFF), height 44px, ticket outline icon on left, "Enter Promo Code" placeholder, right chevron icon.

Bottom Navigation Bar: Fixed bottom, #FFFFFF background, height 68px, 5 equally spaced tabs (Home, Chat, Wishlist, Cart, Profile). Active tab uses filled #2E69C6 icon and label; inactive tabs use 1.5px outline #6B7280 icons.