# TamaChicken

Toddler-friendly chicken pet game (ages 1–5) by [Marie Apellanes](https://apellanes.com.au).

## Play on iPhone (PWA + GitHub Pages)

1. Push this repo to GitHub
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. Push to `main` (or run **Actions → Deploy GitHub Pages**)
4. Open the site URL on your iPhone in **Safari** (example):
   `https://YOUR_GITHUB_USERNAME.github.io/tamachicken/`
5. Tap **Share → Add to Home Screen → Add**

The game installs like an app icon and can work offline after the first visit.

## Play locally (web)

```bash
npm install
npm run dev
```

## Mobile (iOS / Android native)

This app is also packaged with [Capacitor](https://capacitorjs.com/).

```bash
npm install
npm run mobile:sync
```

- Android: `npm run mobile:android` (opens Android Studio)
- iOS: `npm run mobile:ios` (opens Xcode on macOS)

App ID: `au.com.apellanes.tamachicken`

## Versioning & GitHub Releases

Version lives in `package.json` and syncs into native projects:

```bash
npm run bump:patch   # 1.0.0 -> 1.0.1
npm run bump:minor   # 1.0.0 -> 1.1.0
npm run bump:major   # 1.0.0 -> 2.0.0
npm run sync:version # push version into android/ios
```

### Release from GitHub

1. **Actions → Release → Run workflow**
2. Choose `patch`, `minor`, or `major`
3. Workflow bumps version, tags `vX.Y.Z`, builds Android APK + iOS simulator zip + web zip, and publishes a GitHub Release

Or push a tag yourself:

```bash
git tag v1.0.1
git push origin v1.0.1
```

## Developer

**Marie Apellanes** — [apellanes.com.au](https://apellanes.com.au)
