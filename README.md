# 🃏 It's a 9 Thing! - Mobile Scoring App

A sleek, responsive mobile Progressive Web App (PWA) designed to track, calculate, and manage scoring for the 13-round card game **"It's a 9 Thing!"**. 

Featuring **Gemini Multimodal Vision AI** to snap photos of losing hands and automatically calculate scores based on official game rules, wild card penalties, win types, and multipliers.

---

## ✨ Features

- **Rule-Accurate 13-Round Sequence**:
  - Rounds 1 through 13 with dynamic wild cards: `R1: Aces` → `R2: 2s` → ... → `R11: Jacks` → `R12: Queens` → `R13: Kings`.
  - Number cards at face value (Ace = 1, 2–10 = 2–10 pts).
  - Face cards (J, Q, K) = 10 pts.
  - Wild cards held in losing hand = Face value + **10-point penalty**.
  - **Discard Pile Win**: Scored only against the player who discarded the winning card.
  - **Draw Pile Win**: Scored against all losing players' hands.
  - **2-Player Doubling Rule**: 2-player draw pile wins automatically score **2x double points**.
- **Gemini Multimodal AI Camera Scanning**:
  - Take a photo directly with your phone's camera (`capture="environment"`) or upload from gallery.
  - Automatically identifies all 9 cards in the losing hand via Gemini Vision.
  - Visual verification tray to adjust or add cards in 1 tap before finalizing.
- **Offline Manual Card Picker**:
  - Fast 2-tap (Rank + Suit) manual entry fallback for offline play.
- **Live Leaderboard & Point Deficit Tracker**:
  - Standings with custom avatars (`👑`, `🦁`, `🦊`, `🐼`, `🐯`, `🦄`, `⚡`, etc.).
  - Tracks round starters.
  - In the final 3 rounds (Rounds 11, 12, 13), displays real-time point gaps from the leader (e.g. `⚡ 120 pts behind`).
- **Post-Game Awards & In-Depth Statistics**:
  - Grand Champion podium & confetti celebration.
  - **Points Leaked / Surrendered**: Total points given away from each player's losing hands.
  - **Biggest Single-Round Win**: Highlight card showing the single highest scoring round.
  - **Most Rounds Won**: Player with the most round victories.
  - **Wild Card Magnet**: Player penalized with the most wild cards.
  - Full round-by-round scoreboard history.
- **Game Resume (Auto-Save)**:
  - Game state is continuously saved in browser `localStorage` — never lose your game on page refresh or phone lock.
- **In-App API Key Settings**:
  - Enter your free Gemini API key locally on your phone (no backend needed).

---

## 🚀 Getting Started

### 1. Run Locally
```bash
npm install
npm run dev
```

### 2. Build for Production
```bash
npm run build
```

---

## 🌐 Deploy to GitHub Pages

This repository is pre-configured with an automated GitHub Actions deployment workflow (`.github/workflows/deploy.yml`).

1. Push this repository to GitHub.
2. In your repository on GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. GitHub Actions will automatically build and publish the app to `https://oiiimysize.github.io/9-thing-scoring-app/`.
5. Open the link on your mobile phone, tap **"Add to Home Screen"** in Safari / Chrome, and enjoy a native app experience!

---

## 🔑 Gemini API Key Setup

1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Open the app, click the **Settings (⚙️)** icon in the top right.
3. Paste your key and click **Save Key**. The key is stored locally in your browser's secure `localStorage`.
