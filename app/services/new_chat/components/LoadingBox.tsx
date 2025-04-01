"use client";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LoadingBoxProps {
  size?: number;
  color?: string;
  thickness?: number;
  fullScreen?: boolean;
  message?: string;
  sx?: React.CSSProperties;
}

const LoadingBox: React.FC<LoadingBoxProps> = ({
  size = 40,
  color = "#0d47a1",
  thickness = 3.6,
  fullScreen = false,
  message,
  sx = {},
}) => {
  const styles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "1.5rem",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    ...sx,
  };

  const containerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: fullScreen ? "100vw" : "100%",
    height: fullScreen ? "100vh" : "100%",
    position: fullScreen ? "fixed" : "relative",
    top: 0,
    left: 0,
    zIndex: fullScreen ? 9999 : 1,
    backgroundColor: fullScreen ? "rgba(255, 255, 255, 0.8)" : "transparent",
  };

  return (
    <div style={containerStyles}>
      <div style={styles}>
        <LoadingSpinner
          size={size}
          color={color}
          thickness={thickness}
          center={false}
        />

        {message && (
          <div
            style={{
              marginTop: "1rem",
              textAlign: "center",
              color: "#666",
              fontSize: "0.875rem",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingBox;
