import './polyfills';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ── Startup environment validation ──────────────────────────────────────────
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;
requiredEnvVars.forEach(key => {
  if (!import.meta.env[key]) {
    console.error(`❌ Missing required env var: ${key}. Check your .env file.`);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
