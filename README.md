# Unibrix TMA Showcase

Telegram Mini App demonstrating native TMA capabilities. Built by [Unibrix](https://unibrix.io) to showcase expertise in Telegram Mini App development.

**Stack:** React 18 · TypeScript · Vite · Zustand · [@tma.js/sdk-react](https://docs.telegram-mini-apps.com/) · [Telegram UI](https://github.com/Telegram-Mini-Apps/TelegramUI)

## Features

| Page | TMA Feature | Description |
|------|-------------|-------------|
| **Wallet** | `biometry` | Biometric-protected crypto price list (Face ID / Fingerprint) |
| **Weather** | `locationManager` | Location-based weather using device geolocation |
| **Photos** | `qrScanner` | QR scanner and photo gallery with camera access |
| **Settings** | `cloudStorage` | User profile, preferences, cloud storage demo |

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173/ — the app runs with a mock Telegram environment.

## Try in Telegram

Open [@unibrix_demo_bot](https://t.me/unibrix_demo_bot) and click the menu button.

## Deploy to GitHub Pages

**1. Configure base path**

Edit `vite.config.ts` with your repo name:
```ts
// github.com/YourUsername/your-repo → '/your-repo/'
base: command === 'serve' ? '/' : '/tg-public-app/',
```

**2. Enable GitHub Pages**

Go to repo **Settings → Pages → Source: GitHub Actions**

**3. Push to main**

The GitHub Action builds and deploys automatically on every push.

## Connect to Telegram

**1. Create a bot**

Open [@BotFather](https://t.me/BotFather) and send `/newbot`. Save the token.

**2. Configure environment**

```bash
cp .env.example .env
```

Edit `.env`:
```
BOT_TOKEN=your_token_from_botfather
APP_URL=https://yourusername.github.io/your-repo/
```

**3. Run setup script**

```bash
./scripts/setup-bot.sh
```

**4. Test it**

Open your bot in Telegram — click the menu button to launch the app!

## SDK Features

| Feature | Description |
|---------|-------------|
| `initData` | User info (name, username, photo, premium status) |
| `themeParams` | Auto dark/light theme from Telegram |
| `hapticFeedback` | Vibration feedback |
| `backButton` | Native back navigation |
| `mainButton` | Bottom action button |
| `popup` | Native alert dialogs |
| `cloudStorage` | Persist data across sessions |
| `biometry` | Face ID / Fingerprint authentication |
| `locationManager` | Device geolocation |
| `qrScanner` | QR code scanning |

## Project Structure

```
src/
├── components/
│   ├── App.tsx           # Router + theme setup
│   ├── TabBar/           # Bottom tab navigation
│   ├── Page.tsx          # Page wrapper
│   └── Root.tsx          # Error boundary wrapper
├── pages/
│   ├── WalletPage/       # Biometric protected list
│   ├── WeatherPage/      # Location-based weather
│   ├── PhotosPage/       # QR scanner + gallery
│   └── SettingsPage/     # User settings
├── store/                # Zustand state management
├── navigation/
│   └── routes.tsx        # Route definitions
├── init.ts               # SDK initialization
└── mockEnv.ts            # Mock for local development
```

## Environment Variables

App variables use `VITE_` prefix and are embedded at build time:

```bash
# .env
VITE_API_URL=https://api.example.com
```

```ts
// In code
const url = import.meta.env.VITE_API_URL
```

For GitHub Actions, add secrets in **Settings → Secrets → Actions**.

## Resources

- [Telegram Mini Apps Docs](https://core.telegram.org/bots/webapps)
- [TMA.js SDK Documentation](https://docs.telegram-mini-apps.com/)
- [Telegram UI Components](https://github.com/Telegram-Mini-Apps/TelegramUI)

## License

MIT
