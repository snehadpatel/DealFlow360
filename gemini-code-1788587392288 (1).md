# Revalo - Design System (design.md)

This document outlines the core design specifications, tokens, and components based on the Revalo Dashboard UI.

## 1. Color Palette

The design utilizes a clean, high-contrast palette with a distinctive orange primary accent, balanced by neutral grays and a dark mode component for specific data highlights.

### Primary Colors
*   **Primary Orange:** `#F26C4F` (Used for active states, main buttons, primary chart data)
*   **Secondary Orange/Peach:** `#F8B179` (Used for secondary chart data and gradients)

### Neutral Colors
*   **Background (App):** `#F4F5F7` (Light grayish-blue for the main app background)
*   **Surface (Cards):** `#FFFFFF` (White for standard cards and containers)
*   **Surface (Dark):** `#161616` (Deep black/gray used for the "Cashflow" highlight card)

### Text Colors
*   **Text Primary:** `#1F2937` (Dark gray for headings and key metrics)
*   **Text Secondary:** `#6B7280` (Medium gray for labels, subtitles, and standard table text)
*   **Text Inverse:** `#FFFFFF` (White text on dark surfaces or primary buttons)

### Semantic Colors
*   **Success (Green):** `#10B981` (Used for positive trends, e.g., "+8% VS Last Week", "Sold" status)
*   **Danger/Warning (Red):** `#EF4444` (Used for negative trends, e.g., "-12% VS Last Week", "Detected" labels)
*   **Warning (Yellow):** `#F59E0B` (Used for "Pending" status badges)

---

## 2. Typography

The dashboard uses a clean, modern sans-serif typeface. Recommended fonts: **Inter**, **Roboto**, or **Public Sans**.

*   **Font Family:** `'Inter', sans-serif`
*   **Base Size:** `14px`

### Typographic Hierarchy
*   **H1 (Large Metrics):** `28px` to `32px`, Semi-Bold, Primary Text Color (e.g., "$34,678", "435")
*   **H2 (Card Titles):** `16px`, Medium, Primary Text Color (e.g., "Sales analytics", "Cashflow")
*   **H3 (Subheadings):** `14px`, Medium, Primary Text Color
*   **Body Standard:** `13px`, Regular, Secondary Text Color
*   **Small/Labels:** `12px`, Regular, Secondary Text Color (e.g., "Monthly", "Weekly")

---

## 3. Spacing & Layout

The layout relies on a standard 4pt or 8pt grid system.

*   **App Padding:** `24px` around the main dashboard container.
*   **Card Padding:** `20px` to `24px` inside standard cards.
*   **Element Gap:** `16px` between metric cards; `24px` between major sections.
*   **Border Radius (Standard):** `16px` (Large cards and main containers)
*   **Border Radius (Small):** `8px` (Buttons, tags, inner elements)

---

## 4. UI Components

### 4.1 Buttons & Nav Items
*   **Active Nav Pill:** Background: Primary Orange (`#F26C4F`), Text: White, Border-radius: `24px` (Pill shape).
*   **Inactive Nav Pill:** Background: Transparent, Text: Secondary Text, Border-radius: `24px`.
*   **Primary CTA Button:** Solid Primary Orange, White text, Pill shape (e.g., "View All Reports").
*   **Toggle/Switch Buttons:** Small pill shapes inside a light gray container (e.g., Monthly/Weekly toggle).

### 4.2 Cards & Containers
*   **Standard Metric Card:** 
    *   Background: White
    *   Border: `1px solid #E5E7EB` (or soft drop shadow: `0 2px 4px rgba(0,0,0,0.02)`)
    *   Border-radius: `16px`
*   **Dark Accent Card (Cashflow):**
    *   Background: Dark Surface (`#161616`)
    *   Text: White
    *   Border-radius: `16px`

### 4.3 Badges & Tags
*   **Trend Badge (Positive):** Text `#10B981` (Green), with an upward triangle icon.
*   **Trend Badge (Negative):** Text `#EF4444` (Red), with a downward triangle icon.
*   **Status Pill (Sold):** Light green background (`#D1FAE5`), Green text (`#065F46`).
*   **Status Pill (Pending):** Light yellow background (`#FEF3C7`), Yellow text (`#92400E`).
*   **Alert Tag (Detected):** Outline or light red background, Red text (`#EF4444`).

### 4.4 Data Visualization (Charts)
*   **Bar Charts (Sales Analytics):** Uses Primary Orange for the main metric, Secondary Orange for the comparison metric. Bars have slightly rounded top corners.
*   **Gauge/Donut Chart (Sales Target):** Segmented blocks forming a semi-circle. Uses a gradient progression from Secondary Orange to Primary Orange.
*   **Line Chart (Cashflow - Dark Mode):** Smooth bezier curve. Line color is Primary Orange, with a soft translucent orange fill/glow below the line.

### 4.5 Tables (Property Overview)
*   **Header:** `13px`, Text Secondary, borders on bottom only (soft gray).
*   **Rows:** Include thumbnail images (rounded corners, `32x32px`), dark text for primary data (Customer, Type, Price), pill badges for Status.
*   **Padding:** Spacious rows, roughly `16px` vertical padding per cell.

---

## 5. Iconography

*   **Style:** Minimalist, line-based, 24x24px bounding box, `1.5px` to `2px` stroke weight.
*   **Use Cases:** Sidebar navigation, top right utility icons (Search, Notifications), inline with card titles (eye for views, dollar sign for funds).