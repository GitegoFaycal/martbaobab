import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { I18nProvider } from "./i18n";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
