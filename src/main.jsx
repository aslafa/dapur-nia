import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { seedFirestore } from "./services/seedFirestore";

seedFirestore()
  .then(() => console.log("🔥 DATA DUMMY BERHASIL MASUK FIRESTORE"))
  .catch((error) => console.error("❌ SEED FIRESTORE GAGAL:", error));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);