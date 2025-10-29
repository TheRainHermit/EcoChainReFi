"use client";

import { useEffect, useState } from "react";

interface CameraOverlayProps {
  backendUrl?: string;
  walletAddress?: string; // <-- ahora opcional
  onDepositSuccess?: (material: string, amount: number) => void;
}

export default function CameraOverlay({ backendUrl, walletAddress = "", onDepositSuccess }: CameraOverlayProps) {
  const src =
    (backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") +
    "/video_feed";

  const [prediction, setPrediction] = useState<{ material: string | null; confidence: number | null }>({
    material: null,
    confidence: null,
  });
  const [lastDeposited, setLastDeposited] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          (backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/predict"
        );
        const data = await res.json();
        setPrediction(data);
      } catch (err) {
        setPrediction({ material: null, confidence: null });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  useEffect(() => {
    if (
      prediction.material &&
      prediction.material !== lastDeposited &&
      walletAddress && walletAddress.length > 0 // <-- requiere dirección para procesar depósito
    ) {
      const materialToDeposit = prediction.material;
      const timeout = setTimeout(async () => {
        const res = await fetch(
          (backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/deposit",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              material: materialToDeposit,
              wallet: walletAddress,
            }),
          }
        );
        const data = await res.json();
        if (data.success) {
          setLastDeposited(materialToDeposit);
          if (onDepositSuccess) {
            onDepositSuccess(materialToDeposit, data.amount);
          }
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [prediction.material, walletAddress, lastDeposited, backendUrl, onDepositSuccess]);

  // Seguridad de tipos: calcular fuera del JSX para evitar warnings de TS sobre null
  const detectedMaterial = prediction.material;
  const confidencePct = prediction.confidence != null ? (prediction.confidence * 100).toFixed(1) : null;

  return (
    <div className="w-full max-w-[720px] mx-auto my-4 rounded-xl overflow-hidden border border-emerald-100 shadow-lg bg-white">
      <img src={src} alt="Camera feed" className="w-full h-[720px] object-cover" />
      <div className="p-2 text-center">
        {detectedMaterial ? (
          <span className="text-emerald-700 font-semibold">
            Material detectado: {detectedMaterial}
            {confidencePct ? ` (${confidencePct}%)` : null}
          </span>
        ) : (
          <span className="text-gray-500">No se detecta material</span>
        )}
      </div>
    </div>
  );
}
