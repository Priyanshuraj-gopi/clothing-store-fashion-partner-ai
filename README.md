# 👗 CLOTHING STORE FASHION PARTNER AI

> **An enterprise-grade, multimodal in-store & online fashion assistant transforming retail shopping with computer vision fit analysis, voice-enabled AI styling, interactive store navigation, associate CRM, and production serverless deployment.**

[![CI](https://github.com/Priyanshuraj-gopi/clothing-store-fashion-partner-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/Priyanshuraj-gopi/clothing-store-fashion-partner-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)

---

## 🌟 Highlights & Overview

**CLOTHING STORE FASHION PARTNER AI** brings modern generative AI directly into the retail and apparel shopping journey. Designed for dual deployment—as an interactive in-store smart kiosk or as an e-commerce digital stylist—this platform acts as a personal fashion concierge:

1. **Intelligent Fit & Body Analysis**: Analyzes proportions, shoulder structure, and silhouette using computer vision to suggest clothing sizes and cuts that flatter each individual.
2. **Interactive Voice & Text AI Stylist**: Engage in real-time fashion consultations with conversational AI, complete with speech recognition and natural voice synthesis.
3. **Dynamic Occasion Lookbooks**: Generates bespoke curated outfits for any event—from Date Nights and Boardroom Meetings to Weddings, Streetwear, and Vacation getaways.
4. **Smart In-Store Shelf Navigation**: Interactive floor plan and locator directing customers straight to the exact section, rack, and aisle where their desired items hang.
5. **Integrated Cart & Checkout**: Save favorite looks, mix-and-match accessories, adjust fit profiles, and complete purchases smoothly.
6. **Associate CRM & Customer Lifecycle Portal**: In-store staff dashboard managing customer registration, VIP styling notes, fitting room stages, and CSV client list exports.
7. **Production-Hardened Serverless Backend**: Pre-configured Netlify and Vercel serverless proxy functions that protect OpenAI API keys with zero browser credential exposure and enterprise HTTP security headers.

---

## ✨ Core Features

### 📸 1. Visual Fit & Proportion Analysis
- **Live Hardware Camera Integration**: Access device webcams (front or rear camera toggling) with custom silhouette guide overlay.
- **Image Upload & Drag-and-Drop**: Upload existing photos with instant preview and memory-safe `URL.revokeObjectURL()` cleanup.
- **Silhouette Detection**: Estimates height, shoulder profile, frame proportions, and tailored fit preferences (Slim, Regular, Relaxed-Tailored, Oversized).
- **Proactive Styling Suggestions**: Instant feedback on complementary silhouettes, color palettes, and layering strategies.

### 🎙️ 2. Conversational AI Stylist (Voice + Text)
- **Natural Voice Interaction**: Integrated microphone input with real-time speech-to-text.
- **Audio Feedback**: Text-to-speech engine provides audible styling advice and outfit explanations.
- **Intelligent Fallbacks**: Automatic graceful degradation to rule-based fashion heuristics if network connectivity or API access is interrupted.

### 👔 3. Curated Lookbooks & Occasions
- Filter looks across multiple vibes: *Minimal*, *Streetwear*, *Classic*, *Quiet Luxury*, *Trendy*, *Bold*, or *Surprise Me*.
- Tailor outfits for: *Date Night*, *College*, *Office*, *Wedding*, *Party*, *Casual*, *Vacation*, or *Custom Occasions*.
- Detailed product breakdown with brands, pricing in INR (₹), color options, and styling logic.

### 🗺️ 4. In-Store Interactive Map & Shelf Locator
- Visualized floor map showing department zones, display racks, and fitting rooms.
- Real-time pinpoint routing to the exact rack for any selected garment.
- Eliminates endless wandering in physical retail stores.

### 👥 5. In-Store Associate CRM Portal
- **Customer Lifecycle Stages**: Track visitors through `New Lead` → `Fitting Room` → `Styling Active` → `VIP Client` → `Completed`.
- **Customer Registration**: Quick modal to onboard in-store shoppers with sizing, fit preferences, and VIP notes.
- **Search & Multi-Filters**: Instant client filtering by stage and sizing.
- **CSV Data Export**: One-click download of store client lists for CRM sync.

### 🛍️ 6. Seamless Wardrobe & Cart Management
- Save and bookmark looks to revisit later.
- Add whole outfits or individual pieces to the bag.
- Quick summary with taxes, discounts, shipping, and instant checkout flow.

---

## ⚡ Performance & Core Web Vitals (CWV)

- **Manual Chunk Splitting**: Bundles are cleanly split into `vendor-react`, `vendor-motion`, and `vendor-icons`.
- **Main App Footprint**: Main application JavaScript is only **70.9 kB (19.5 kB gzipped)**.
- **Non-blocking Typography**: Google Fonts (`Outfit` and `Playfair Display`) load with DNS preconnects and asynchronous `display=swap`.
- **Accessibility Compliance (WCAG 2.2 AA)**: All text tokens exceed standard 4.5:1 contrast ratios, and animations support `prefers-reduced-motion`.

---

## 🛠️ Tech Stack & Architecture

```text
├── api/
│   └── stylist.ts               # Vercel Serverless Function (OpenAI proxy)
├── netlify/
│   └── functions/
│       └── stylist.ts           # Netlify Serverless Function (OpenAI proxy)
├── public/                      # Static assets & icons
├── src/
│   ├── components/
│   │   ├── CameraCaptureModal.tsx # Live camera stream modal & silhouette overlay
│   │   └── CrmPortal.tsx        # In-store associate CRM dashboard & registration
│   ├── data/
│   │   ├── crmData.ts           # CRM customer store records & lifecycle states
│   │   └── inventory.ts         # Retail store catalog, categories & shelf coordinates
│   ├── hooks/
│   │   └── useSpeechManager.ts  # Voice recognition & synthesis controller
│   ├── lib/
│   │   ├── stylistClient.ts     # API client with serverless proxy & heuristic fallback
│   │   └── stylistEngine.ts     # Recommendation heuristics, fit rules & store routing
│   ├── types.ts                 # Shared TypeScript schemas (Product, Outfit, Cart, CRM)
│   ├── App.tsx                  # Main application orchestrator & multi-screen flow
│   ├── index.css                # Global design system, glass effects & UI tokens
│   └── main.tsx                 # React application entrypoint
├── index.html                   # HTML shell & font definitions
├── netlify.toml                 # Netlify deployment configuration & security headers
├── vercel.json                  # Vercel deployment configuration & security headers
├── vite.config.ts               # Bundler configuration with manual chunking
└── tsconfig.json                # TypeScript strict configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Priyanshuraj-gopi/clothing-store-fashion-partner-ai.git
   cd clothing-store-fashion-partner-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Add your OpenAI API key to `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4o-mini
   ```
   *(Note: The app includes built-in heuristic styling rules that work out of the box even without an external API key!)*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

6. **Preview Production Build:**
   ```bash
   npm run preview
   ```

---

## 🌐 Production Deployment

### Option A: Deploy to Netlify
The repository includes `netlify.toml` and `netlify/functions/stylist.ts`:
1. Connect your repository to [Netlify](https://app.netlify.com/).
2. Netlify will automatically detect `netlify.toml`:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Add Environment Variable:
   - `OPENAI_API_KEY` = your secret OpenAI API key.
4. Deploy! Netlify automatically mounts the serverless proxy at `/api/stylist` and applies all security headers (`X-Frame-Options`, `X-Content-Type-Options`, `HSTS`).

### Option B: Deploy to Vercel
The repository includes `vercel.json` and `api/stylist.ts`:
1. Connect your repository to [Vercel](https://vercel.com/).
2. Set Environment Variable:
   - `OPENAI_API_KEY` = your secret OpenAI API key.
3. Deploy! Vercel handles the Vite build and executes `api/stylist.ts` at `/api/stylist`.

---

## 🔒 Security & Privacy

- **Zero Client-Side Key Leaks**: In production, the browser calls `/api/stylist`. The `OPENAI_API_KEY` is kept exclusively on the serverless backend.
- **Enterprise Security Headers**: Configured across both Netlify and Vercel:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- **Memory & Media Lifecycle**: Camera `MediaStream` tracks are stopped immediately upon modal close, and object URLs are revoked to prevent memory leaks.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Created by **[Priyanshu Raj](https://github.com/Priyanshuraj-gopi)**
