# 👗 CLOTHING STORE FASHION PARTNER AI

> **An intelligent, multimodal in-store & online fashion assistant that transforms retail shopping with computer vision fit analysis, voice-enabled AI styling, curated lookbooks, and real-time store shelf navigation.**

---

## 🌟 Highlights & Overview

**CLOTHING STORE FASHION PARTNER AI** brings modern generative AI directly to the retail and apparel shopping experience. Whether customers are shopping online or standing in a physical retail store, this platform acts as a personal fashion concierge:

1. **Intelligent Fit & Body Analysis**: Analyzes proportions, shoulder structure, and silhouette using computer vision to suggest clothing sizes and cuts that flatter each individual.
2. **Interactive Voice & Text AI Stylist**: Engage in real-time fashion consultations with conversational AI, complete with speech recognition and natural voice synthesis.
3. **Dynamic Occasion Lookbooks**: Generates bespoke curated outfits for any event—from Date Nights and Boardroom Meetings to Weddings, Streetwear, and Vacation getaways.
4. **Smart In-Store Shelf Navigation**: Interactive floor plan and locator directing customers straight to the exact section, rack, and aisle where their desired items hang.
5. **Integrated Cart & Checkout**: Save favorite looks, mix-and-match accessories, adjust fit profiles, and complete purchases smoothly.

---

## ✨ Core Features

### 📸 1. Visual Fit & Proportion Analysis
- **Camera & Image Upload**: Snap a live photo or drag & drop existing pictures.
- **Silhouette Detection**: Estimates height, shoulder profile, frame proportions, and tailored fit preferences (Slim, Regular, Relaxed-Tailored, Oversized).
- **Proactive Styling Suggestions**: Instant feedback on complementary silhouettes, color palettes, and layering strategies.

### 🎙️ 2. Conversational AI Stylist (Voice + Text)
- **Natural Voice Interaction**: Integrated microphone input with real-time speech-to-text.
- **Audio Feedback**: Text-to-speech engine provides audible styling advice and outfit explanations.
- **Smart Recommendations**: Suggests matching accessories, contrasting shoes, and accent pieces on the fly.

### 👔 3. Curated Lookbooks & Occasions
- Filter looks across multiple vibes: *Minimal*, *Streetwear*, *Classic*, *Quiet Luxury*, *Trendy*, *Bold*, or *Surprise Me*.
- Tailor outfits for: *Date Night*, *College*, *Office*, *Wedding*, *Party*, *Casual*, *Vacation*, or *Custom Occasions*.
- Detailed product breakdown with brands, pricing in INR (₹), color options, and styling logic.

### 🗺️ 4. In-Store Interactive Map & Shelf Locator
- Visualized floor map showing department zones, display racks, and fitting rooms.
- Real-time pinpoint routing to the exact rack for any selected garment.
- Eliminates endless wandering in physical retail stores.

### 🛍️ 5. Seamless Wardrobe & Cart Management
- Save and bookmark looks to revisit later.
- Add whole outfits or individual pieces to the bag.
- Quick summary with taxes, discounts, shipping, and instant checkout flow.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict typing across products, fit profiles, and cart states)
- **Styling & Design System**: Responsive CSS with glassmorphism, fluid animations, and custom dark/light aesthetic tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Engine**: [OpenAI API](https://openai.com/) integration for live conversational styling & prompt intelligence
- **Speech System**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) with fallback audio state management

---

## 📂 Project Structure

```text
├── public/                 # Static assets & icons
├── src/
│   ├── data/
│   │   └── inventory.ts    # Retail store catalog, categories & shelf coordinates
│   ├── hooks/
│   │   └── useSpeechManager.ts # Voice recognition & synthesis controller
│   ├── lib/
│   │   ├── stylistClient.ts    # OpenAI API client & streaming handlers
│   │   └── stylistEngine.ts    # Recommendation heuristics, fit rules & store routing
│   ├── types.ts            # Shared TypeScript schemas (Product, Outfit, CartLine, FitProfile)
│   ├── App.tsx             # Main application orchestrator & multi-screen flow
│   ├── index.css           # Global design system, glass effects & UI tokens
│   └── main.tsx            # React application entrypoint
├── index.html              # HTML shell & font definitions
├── package.json            # Scripts & project dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build & bundler configuration
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
   *(Note: The app comes with built-in heuristic styling rules that work out of the box even without an external API key!)*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Created by **[Priyanshu Raj](https://github.com/Priyanshuraj-gopi)**
