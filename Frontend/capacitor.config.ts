import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.9850b178952f455aaab508d9fc69bbe2',
  appName: 'speedguard-nexus',
  webDir: 'dist',
  server: {
    url: 'https://9850b178-952f-455a-aab5-08d9fc69bbe2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;