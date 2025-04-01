"use client";
import React from "react";
import LoadingSpinner from "./LoadingSpinner";

interface BoxProps {
  sx?: React.CSSProperties;
  children?: React.ReactNode;
}

// Simple Box component to mimic MUI Box
const Box: React.FC<BoxProps> = ({ sx = {}, children }) => {
  return <div style={{ display: "flex", ...sx }}>{children}</div>;
};

// CircularIndeterminate component similar to MUI example
export default function CircularIndeterminate() {
  return (
    <Box sx={{ display: "flex" }}>
      <LoadingSpinner center={false} />
    </Box>
  );
}
