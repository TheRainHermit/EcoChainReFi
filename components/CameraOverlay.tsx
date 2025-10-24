"use client";

import React from "react";

interface CameraOverlayProps {
  backendUrl?: string;
}

export default function CameraOverlay({ backendUrl }: CameraOverlayProps) {
  const src = (backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/video_feed";

  return (
    <div
      className={
        "pointer-events-none fixed z-50 top-20 left-1/2 -translate-x-1/2 w-[720px] max-w-[90%] h-[360px] bg-white/5 rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      }
      style={{ backdropFilter: "blur(6px)" }}
      aria-hidden
    >
      {/* Usamos una etiqueta img para consumir el stream MJPEG servido por Flask */}
      <img
        src={src}
        alt="Camera feed"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
