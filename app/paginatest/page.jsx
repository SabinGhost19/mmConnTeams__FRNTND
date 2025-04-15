"use client";

import React, { useState } from "react";
import PagA from "./components/pageA";
import PagB from "./components/pageB";

export default function PaginaTest() {
  const [currentPage, setCurrentPage] = useState("pagA");
  const [formData, setFormData] = useState(null);

  const navigateToPage = (page, data = null) => {
    setCurrentPage(page);
    if (data) {
      setFormData(data);
    }
  };

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div className="page-container" style={containerStyle}>
      <h1
        style={{ textAlign: "center", color: "#2c3e50", marginBottom: "30px" }}
      >
        Gestionare Facultate
      </h1>
      {currentPage === "pagA" && (
        <PagA
          useNavigate={() => {
            return (path, options) => {
              if (path === "/pagB") {
                navigateToPage("pagB", options.state);
              } else {
                navigateToPage("pagA");
              }
            };
          }}
        />
      )}
      zz
      {currentPage === "pagB" && (
        <>
          <button
            onClick={() => navigateToPage("pagA")}
            style={{
              margin: "10px 0 20px",
              padding: "8px 16px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            ← Back to Formular
          </button>
          <PagB
            useLocation={() => {
              return {
                state: formData,
              };
            }}
          />
        </>
      )}
    </div>
  );
}
