// app.config.js — Expo dynamic config (CommonJS to match babel.config.js)
// Firebase config is hardcoded (public-facing web config, not a secret).
// Admin password and EmailJS keys are injected from GitHub Secrets at build time.

module.exports = ({ config }) => ({
  ...config,
  name: 'CBTI',
  slug: 'cbti-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    backgroundColor: '#18140e',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#18140e',
    },
    package: 'com.cbti.app',
    versionCode: 1,
    newArchEnabled: false,
  },
  plugins: ['expo-font'],
  extra: {
    // Firebase — hardcoded (Firebase web config is designed to be in client code)
    firebaseApiKey:            'AIzaSyDO63J_szRNP9Gje2Gyue1VhihXM6ehPhY',
    firebaseAuthDomain:        'cbti-app.firebaseapp.com',
    firebaseDatabaseURL:       'https://cbti-app-default-rtdb.asia-southeast1.firebasedatabase.app/',
    firebaseProjectId:         'cbti-app',
    firebaseStorageBucket:     'cbti-app.firebasestorage.app',
    firebaseMessagingSenderId: '826656871637',
    firebaseAppId:             '1:826656871637:web:987b2955ac38a18b6ebe5c',
    // Admin vault — injected from GitHub Secrets at build time
    adminUser: process.env.ADMIN_USER || 'cbti',
    adminPass: process.env.ADMIN_PASS || '',
    // EmailJS — injected from GitHub Secrets at build time
    emailjsPublicKey:  process.env.EMAILJS_PUBLIC_KEY  || '',
    emailjsTemplateId: process.env.EMAILJS_TEMPLATE_ID || '',
    emailjsServiceId:  process.env.EMAILJS_SERVICE_ID  || '',
  },
});
