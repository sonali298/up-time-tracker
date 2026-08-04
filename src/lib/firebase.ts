import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAC9S5rd79k472KgSLEqPRe6yxWg3I1C9Q",
  authDomain: "uptime-tracker-pro-87848.firebaseapp.com",
  projectId: "uptime-tracker-pro-87848",
  storageBucket: "uptime-tracker-pro-87848.firebasestorage.app",
  messagingSenderId: "561958007714",
  appId: "1:561958007714:web:482990579535a87256f8fb",
  measurementId: "G-31VKBK1K9L"
};

// Avoid duplicate initialization during HMR.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

if (typeof window !== "undefined") {
  analyticsSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch((error) => {
      console.error("[firebase] analytics init failed", error);
    });
}

export { app, auth, googleProvider };