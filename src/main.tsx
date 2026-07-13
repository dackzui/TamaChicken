import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

async function setupNativeChrome() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#8fd3f4' })
  } catch {
    // Status bar plugin may be unavailable in some hosts
  }
}

function setupPwa() {
  if (Capacitor.isNativePlatform()) return
  registerSW({ immediate: true })
}

void setupNativeChrome()
setupPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
