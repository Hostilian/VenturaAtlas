# Deploying Real Friend Collaboration (Firebase Auth & Cloud Firestore)

VenturaAtlas uses **Firebase Anonymous Authentication** and **Cloud Firestore** for zero-friction friend collaboration rooms without requiring users to log in with GitHub accounts.

## 1. Firebase Project Setup

1. Create a Firebase Project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Enable **Authentication** -> Sign-in method -> **Anonymous**.
3. Enable **Cloud Firestore** in Production mode.
4. Deploy security rules from `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 2. Public Runtime Configuration

In `assets/js/config.js`, configure your non-secret Firebase web client credentials:

```javascript
window.VA_CONFIG = {
  firebase: {
    apiKey: "AIzaSy...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef"
  }
};
```

## 3. Local & Offline Fallback Mode

If `window.VA_CONFIG.firebase` is unconfigured or network is unavailable, VenturaAtlas automatically falls back to **Personal Local Room Mode** using `localStorage`. No features break when Firebase credentials are absent.
