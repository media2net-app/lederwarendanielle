"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface BarcodeInputProps {
  onScan: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  cameraEnabled?: boolean;
  disabled?: boolean;
}

export default function BarcodeInput({
  onScan,
  placeholder = "Scan barcode (EAN/SKU)...",
  autoFocus = true,
  cameraEnabled = true,
  disabled = false,
}: BarcodeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const emitScan = useCallback(
    (v: string) => {
      const trimmed = v.trim();
      if (trimmed) {
        onScan(trimmed);
        setValue("");
      }
    },
    [onScan]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (value) {
          emitScan(value);
        }
        return;
      }
    },
    [value, emitScan]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  const handleCameraClick = useCallback(async () => {
    if (!cameraEnabled || cameraOpen) return;
    setCameraError(null);
    setCameraOpen(true);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const video = document.getElementById("barcode-camera-preview") as HTMLVideoElement;
      if (!video) {
        setCameraError("Video element niet gevonden");
        setCameraOpen(false);
        return;
      }
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const videoDev = devices[0];
      if (!videoDev) {
        setCameraError("Geen camera gevonden");
        setCameraOpen(false);
        return;
      }
      reader.decodeFromVideoDevice(videoDev.deviceId, video, (result, err) => {
        if (result) {
          const text = result.getText();
          if (text) {
            onScan(text);
            setCameraOpen(false);
          }
        }
      });
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : "Camera kon niet worden gestart");
      setCameraOpen(false);
    }
  }, [cameraEnabled, cameraOpen, onScan]);

  const handleCloseCamera = useCallback(() => {
    setCameraOpen(false);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          autoComplete="off"
        />
        {cameraEnabled && (
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={disabled || cameraOpen}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Camera
          </button>
        )}
      </div>
      {cameraOpen && (
        <div className="relative rounded-lg border border-gray-200 bg-black/5 p-4">
          <video
            id="barcode-camera-preview"
            className="h-48 w-full rounded object-cover"
            muted
            playsInline
          />
          <button
            type="button"
            onClick={handleCloseCamera}
            className="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-600"
          >
            Sluiten
          </button>
          <p className="mt-2 text-center text-sm text-gray-600">Richt de camera op de barcode</p>
        </div>
      )}
      {cameraError && (
        <p className="text-sm text-red-600">{cameraError}</p>
      )}
    </div>
  );
}
