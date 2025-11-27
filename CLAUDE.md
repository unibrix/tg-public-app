# Unibrix TMA Showcase

Telegram Mini App demonstrating TMA capabilities for client showcase.

## Tech Stack

- React 18 + TypeScript + Vite
- @tma.js/sdk-react - TMA SDK
- @telegram-apps/telegram-ui - UI components
- Zustand - State management
- react-router-dom - Routing

## Project Structure

```
src/
├── components/     # Shared components (App, TabBar, Page)
├── pages/          # Page components (Wallet, Weather, Photos, Settings)
├── store/          # Zustand store with cloud storage adapter
├── navigation/     # Route definitions
├── css/            # Styles
└── hooks/          # Custom hooks
```

## Commands

```bash
npm run dev        # Local dev (mock TMA)
npm run dev:tunnel # ngrok + auto-update bot URL (real device testing)
npm run build      # Production build
npm run lint       # ESLint
```

## Environment

- `.env.development` → `npm run dev`
- `.env.production` → `npm run build`

## Git Conventions

- Short, concise commit messages
- No AI/Claude mentions in commits
- One logical change per commit

## TMA Features Used

- `biometry` - Face ID / fingerprint auth
- `locationManager` - Geolocation
- `qrScanner` - QR code scanning
- `cloudStorage` - Persistent storage
- `hapticFeedback` - Vibration feedback
- `initData` - User info

## Bot

- Bot: @unibrix_demo_bot
- URL: https://unibrix.github.io/tg-public-app/
