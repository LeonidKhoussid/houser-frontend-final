import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Monitor localStorage changes to auth_token
const originalSetItem = localStorage.setItem;
const originalRemoveItem = localStorage.removeItem;
const originalClear = localStorage.clear;

localStorage.setItem = function(key, value) {
  originalSetItem.apply(this, arguments);
};

localStorage.removeItem = function(key) {
  originalRemoveItem.apply(this, arguments);
};

localStorage.clear = function() {
  originalClear.apply(this, arguments);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
