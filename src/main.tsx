import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/index.scss";
import App from "./App.tsx";
import { store } from "./store/store.ts";
import { Provider } from "react-redux";

createRoot(document.getElementById("root")!).render(
  // React вмонтирет сюда всё приложение (Provider нужен для Redux Toolkit)
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
