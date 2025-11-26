# Telegram Mini App - React Starter

Minimal starter for Telegram Mini Apps with React + TypeScript.

**Stack:** React 18 · TypeScript · Vite · [@tma.js/sdk-react](https://docs.telegram-mini-apps.com/) · [Telegram UI](https://github.com/Telegram-Mini-Apps/TelegramUI)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173/ — the app runs with a mock Telegram environment.

## Deploy to GitHub Pages

**1. Configure base path**

Edit `vite.config.ts` with your repo name:
```ts
// github.com/YourUsername/your-repo → '/your-repo/'
base: command === 'serve' ? '/' : '/tma-react-starter/',
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

## Project Structure

```
src/
├── components/
│   ├── App.tsx           # Router + theme setup
│   ├── Page.tsx          # Page wrapper with back button
│   ├── Root.tsx          # Error boundary wrapper
│   └── EnvUnsupported.tsx
├── pages/
│   └── IndexPage/        # Home page
├── navigation/
│   └── routes.tsx        # Route definitions
├── init.ts               # SDK initialization
├── mockEnv.ts            # Mock for local development
└── vite-env.d.ts         # TypeScript env types
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
