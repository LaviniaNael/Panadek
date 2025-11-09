import React, { useRef, useEffect, useState } from "react";
import type { ReactNode, MouseEvent, TouchEvent } from "react";

interface ScratchCardProps {
  children: ReactNode;
  isMorning: boolean;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ children, isMorning }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // --- CANVAS DRAWING LOGIC (Unchanged from previous version) ---
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
      gradient.addColorStop(0, "#be185d"); // pink-700
      gradient.addColorStop(0.5, "#f472b6"); // pink-400
      gradient.addColorStop(1, "#be185d"); // pink-700
    } else {
      gradient.addColorStop(0, "#7f1d1d"); // red-900
      gradient.addColorStop(0.5, "#dc2626"); // red-600
      gradient.addColorStop(1, "#7f1d1d"); // red-900
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
    ctx.font = "bold 20px tracking-widest";
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
  };

  const stopScratching = () => {
    isDrawing.current = false;
    checkReveal();
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

  const checkReveal = () => {
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
    }
  };
  // ---------------------------------------------------------

  return (
    <div className="card-wrapper">
      {/* Hidden Message Layer */}
      <div className="hidden-layer">
        <div className="glow-effect" />
        <div className="relative z-10">{children}</div>
      </div>

      {/* Canvas Scratch Layer */}
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
    </div>
  );
};

export default ScratchCard;
