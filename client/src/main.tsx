import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from './contexts/ThemeContext';

// Add global styles
import "@/lib/video-utils"; // Import video utility functions

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
