import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global styles
import "@/lib/video-utils"; // Import video utility functions

createRoot(document.getElementById("root")!).render(<App />);
