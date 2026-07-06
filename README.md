# Pulp Kicktion ⚽️
> Every fan has a story. Let's help them get to their seat.

**Pulp Kicktion** is a GenAI-powered stadium companion for the FIFA World Cup 2026. Built as a dual-interface platform, it serves both fans navigating the stadium and staff operations managing crowd flow, using a single AI brain.

## Features ✨

### 📱 Fan Assistant (Public View)
- **Conversational AI Agent**: Real-time AI chat powered by Groq (Llama 3 70B) to answer questions about gates, seating, queues, and restrooms.
- **Silent Incident Reporting**: When a fan reports an issue (e.g. "Long queue at Gate 5"), the AI seamlessly parses the intent and silently notifies the Operations Dashboard.
- **Multilingual Support**: Fully equipped to help international fans in their native languages via Google Cloud Translation API. *(Stretch Goal Placeholder)*
- **Accessibility Modes**: Supports voice input/output via Web Speech API and TTS. *(Stretch Goal Placeholder)*

### 🛡️ Ops Dashboard (Staff View)
- **Live Heatmap**: Real-time SVG stadium map showing crowd density across various zones (powered by Firestore listeners).
- **Gate Queues Monitoring**: Track wait times and queue lengths at every major gate, instantly reacting to incoming data.
- **AI Situation Reports**: Get automated ops summaries to keep staff informed of the current stadium status without manually crunching numbers.

## Architecture & Tech Stack 🏗️
- **Frontend / Backend**: Next.js 14 (App Router) with Tailwind CSS, deployed on Cloud Run.
- **Database**: Firebase Firestore with strict Security Rules.
- **AI Engine**: Groq SDK for blazing fast inference, equipped with prompt injection guardrails.
- **Icons**: Lucide React.
- **Mock Data Engine**: Includes a deterministic simulator to populate live queues and crowd data without needing physical IoT sensors.

## Getting Started 🚀

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env.local` and add your keys:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Ensure you include your Firebase, Groq, and Google Cloud credentials.*

3. **Seed Staff Account (Optional)**
   If you need a staff login for the Ops Dashboard, run:
   ```bash
   node scripts/seed-staff.js
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to start exploring the Fan View, or head to `/dashboard` to see the Ops panel!

## Security 🔒
- All sensitive credentials are kept entirely server-side using Next.js API Routes.
- Explicit prompt injection guardrails ensure the AI assistant sticks to answering stadium-related inquiries and ignores malicious overrides.
- Firestore Security Rules restrict data access so fans can only touch their own sessions, while only verified staff can view the Ops dashboard.
