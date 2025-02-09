import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import { ProjectProvider } from "./contextapi/allcontext.jsx";
import { BrowserRouter as Router } from "react-router-dom"; // Keep Router here

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      {/* Keep Router here */}
      <ProjectProvider>
        <ToastContainer />
        <App />
      </ProjectProvider>
    </Router>
  </React.StrictMode>
);
