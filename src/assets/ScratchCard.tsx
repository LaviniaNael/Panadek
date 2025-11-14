// src/assets/ScratchCard.tsx
import React, { useRef, useEffect, useState } from "react";
import type { MouseEvent, TouchEvent } from "react";
import "../index.css";

// Define the component's props
interface ScratchCardProps {
  isMorning: boolean;
  message: string;
  onSave: (message: string) => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  isMorning,
  message,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false); // For the save button
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Audio Refs
  const scratchAudioRef = useRef<HTMLAudioElement | null>(null);
  const revealAudioRef = useRef<HTMLAudioElement | null>(null);

  // Effect for initializing sounds
  useEffect(() => {
    scratchAudioRef.current = new Audio("/scratch.mp3");
    scratchAudioRef.current.loop = true;
    scratchAudioRef.current.volume = 0.4;

    revealAudioRef.current = new Audio("/reveal.mp3");
    revealAudioRef.current.volume = 0.6;

    return () => {
      scratchAudioRef.current?.pause();
      revealAudioRef.current?.pause();
      scratchAudioRef.current = null;
      revealAudioRef.current = null;
    };
  }, []);

  // Effect for drawing the canvas (This was missing!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // GRADIENTS
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    if (isMorning) {
      gradient.addColorStop(0, "#be185d");
      gradient.addColorStop(0.5, "#f472b6");
      gradient.addColorStop(1, "#be185d");
    } else {
      gradient.addColorStop(0, "#7f1d1d");
      gradient.addColorStop(0.5, "#dc2626");
      gradient.addColorStop(1, "#7f1d1d");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // TEXTURE
    const noiseDensity = 0.15;
    const numberOfSpecks = canvas.width * canvas.height * noiseDensity * 0.05;
    for (let i = 0; i < numberOfSpecks; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2 + 0.5;
      if (Math.random() > 0.5) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      }
      ctx.fillRect(x, y, size, size);
    }

    // LABEL
    ctx.font = "bold 20px tracking-widest sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      isMorning ? "RUB FOR LOVE" : "SCRATCH ME",
      canvas.width / 2,
      canvas.height / 2
    );
    ctx.shadowBlur = 0;
  }, [isMorning]);

  // --- Helper Functions (These were also missing!) ---

  const getPos = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startScratching = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
    if (!isRevealed) {
      scratchAudioRef.current?.play().catch(() => {});
    }
  };

  const stopScratching = () => {
    isDrawing.current = false;
    scratchAudioRef.current?.pause();
    checkReveal(); // This function call is why 'checkReveal' is needed
  };

  const scratch = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing.current || isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentPos = getPos(e);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPos.current = currentPos;
  };

  // This is the function that was 'declared but not read'
  const checkReveal = () => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    const len = imageData.data.length;
    for (let i = 3; i < len; i += 4) {
      if (imageData.data[i] === 0) transparentPixels++;
    }

    if (transparentPixels / (canvas.width * canvas.height) > 0.45) {
      setIsRevealed(true);
      scratchAudioRef.current?.pause();
      revealAudioRef.current?.play().catch(() => {});
    }
  };

  // Save Button Handler
  const handleSaveClick = () => {
    onSave(message);
    setIsSaved(true);
  };

  // --- JSX ---
  return (
    <div className="card-wrapper relative">
      <div className="hidden-layer">
        <div className="glow-effect" />
        <div className="relative z-10">
          {/* Use the message prop */}
          <div className="message-container">
            <span className="message-icon">{isMorning ? "🌸" : "🌹"}</span>
            <p className="message-text">"{message}"</p>
          </div>
        </div>
      </div>

      {/* The event handlers were missing from the canvas tag! */}
      <canvas
        ref={canvasRef}
        className={`scratch-canvas ${isRevealed ? "revealed" : ""}`}
        onMouseDown={startScratching}
        onTouchStart={startScratching}
        onMouseMove={scratch}
        onTouchMove={scratch}
        onMouseUp={stopScratching}
        onTouchEnd={stopScratching}
        onMouseLeave={stopScratching}
      />

      {/* Save Button */}
      {isRevealed && (
        <button
          className="save-button"
          onClick={handleSaveClick}
          disabled={isSaved}
        >
          {isSaved ? "Saved! 🤍" : "Save this note 🤍"}
        </button>
      )}
    </div>
  );
};

export default ScratchCard;
