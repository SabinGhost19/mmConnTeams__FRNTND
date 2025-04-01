"use client";
import React from "react";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
  center?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color = "#0d47a1",
  thickness = 3.6,
  center = true,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: center ? "center" : "flex-start",
        alignItems: center ? "center" : "flex-start",
        width: center ? "100%" : "auto",
        height: center ? "100%" : "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {/* Track Circle */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: `${thickness}px solid rgba(0, 0, 0, 0.1)`,
            borderRadius: "50%",
          }}
        />

        {/* Spinning Circle */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: `${thickness}px solid transparent`,
            borderTopColor: color,
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />

        {/* Animation Definition */}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingSpinner;
