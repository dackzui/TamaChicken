import type { Config } from '@capacitor/cli'

const config: Config = {
  appId: 'au.com.apellanes.tamachicken',
  appName: 'TamaChicken',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#8fd3f4',
    },
  },
}

export default config
