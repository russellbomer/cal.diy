"use client";

import { useState } from "react";

export function AdminLoginButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="/auth/login"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        fontSize: "0.65rem",
        padding: "0.4rem 0.75rem",
        borderRadius: "1.25rem",
        backgroundColor: "hsl(107, 18%, 15%)",
        color: "hsl(44, 48%, 94%)",
        border: "1px solid hsl(107, 14%, 28%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        opacity: hovered ? 0.9 : 0.4,
        textDecoration: "none",
        letterSpacing: "0.06em",
        zIndex: 9999,
        transition: "opacity 0.2s",
        display: "inline-block",
        lineHeight: 1.4,
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
      admin
    </a>
  );
}
