# Omnisphere R18: Next-Gen Uncensored Social Engine

Welcome to the official repository of the **Omnisphere R18 Engine** ecosystem. This repository contains the complete master blueprints and codebases for the web, mobile, and sign-up layers of the mature social monetization network.

---

## 📁 Repository Structure

* **`omnisphere-app/`**: Core Progressive Web Application (PWA). Includes the uncensored feed, lockable creator content, live Direct Messages simulator, database drawer config, simulated PayPal subscriptions, and the secure **Agent Oracle AI Terminal**.
* **`omnisphere-waitlist/`**: Standalone Vercel-ready waitlist portal featuring an interactive creator handle availability checker and recruiter outreach copy dashboard.
* **`omnisphere-mobile/`**: React Native Expo Router mobile wrapper containing age-gating, feed, messages, secure terminal, and token transaction wallets.

---

## 🚀 Getting Started

### 1. Database Schema Execution
The postgres database script is located at `omnisphere-app/omnisphere-supabase-schema.sql`. Paste this file in your Supabase SQL Editor and click **Run** to set up database persistence tables.

### 2. Running the Core PWA
```bash
cd omnisphere-app
npm install
npm run dev
```

### 3. Running the Waitlist Portal
```bash
cd omnisphere-waitlist
npm install
npm run dev
```

### 4. Running the Mobile Application
```bash
cd omnisphere-mobile
npm install
npx expo start
```
Use Expo Go or run EAS builds to compile native iOS/Android packages.
