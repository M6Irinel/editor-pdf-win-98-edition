import { useState, useRef, useEffect } from "react";
import "./PenTool.css";

function PenTool({ canvasRef, onDraw }) {
  const [thickness, setThickness] = useState(2);
  const [color, setColor] = useState({ r: 0, g: 0, b: 0 });
  const [opacity, setOpacity] = useState(1);
  const overlayRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef([]);
  const thicknessRef = useRef(thickness);
  const colorRef = useRef(color);
  const opacityRef = useRef(opacity);

  useEffect(() => {
    thicknessRef.current = thickness;
    colorRef.current = color;
    opacityRef.current = opacity;
  }, [thickness, color, opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const updateOverlay = () => {
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      overlay.style.position = "absolute";
      overlay.style.left = canvas.offsetLeft + "px";
      overlay.style.top = canvas.offsetTop + "px";
    };

    updateOverlay();
    window.addEventListener("resize", updateOverlay);

    const ctx = overlay.getContext("2d");
    ctx.strokeStyle = "#000000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const startDrawing = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      isDrawingRef.current = true;
      currentPathRef.current = [{ x, y }];
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e) => {
      if (!isDrawingRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      currentPathRef.current.push({ x, y });
      ctx.lineTo(x, y);
      ctx.lineWidth = thicknessRef.current;
      ctx.strokeStyle = `rgba(${colorRef.current.r}, ${colorRef.current.g}, ${colorRef.current.b}, ${opacityRef.current})`;
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (isDrawingRef.current && currentPathRef.current.length > 0) {
        onDraw({
          paths: [
            {
              points: [...currentPathRef.current],
              thickness: thicknessRef.current,
              color: colorRef.current,
              opacity: opacityRef.current,
            },
          ],
        });

        ctx.clearRect(0, 0, overlay.width, overlay.height);

        currentPathRef.current = [];
      }
      isDrawingRef.current = false;
    };

    overlay.addEventListener("mousedown", startDrawing);
    overlay.addEventListener("mousemove", draw);
    overlay.addEventListener("mouseup", stopDrawing);
    overlay.addEventListener("mouseleave", stopDrawing);

    return () => {
      window.removeEventListener("resize", updateOverlay);
      overlay.removeEventListener("mousedown", startDrawing);
      overlay.removeEventListener("mousemove", draw);
      overlay.removeEventListener("mouseup", stopDrawing);
      overlay.removeEventListener("mouseleave", stopDrawing);
    };
  }, [canvasRef, onDraw]);

  return (
    <>
      <canvas ref={overlayRef} className="pen-overlay" style={{ pointerEvents: "auto", cursor: "crosshair" }} />
      <div className="window pen-controls">
        <div className="title-bar">
          <div className="title-bar-text" style={{ padding: "0.5rem" }}>
            Penna
          </div>
        </div>

        <div className="window-body">
          <div className="field-row" style={{ margin: "1rem 0" }}>
            <label>Thickness:</label>
            <input type="range" min="1" max="14" value={thickness} onChange={(e) => setThickness(Number(e.target.value))} />
            <span>{thickness}px</span>
          </div>

          <div className="field-row" style={{ margin: "2rem 0 1.5rem" }}>
            <label>Opacity:</label>
            <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            <span>{Math.round(opacity * 100)}%</span>
          </div>

          <div className="field-row">
            <label>Color:</label>
            <input
              type="color"
              value={`#${[color.r, color.g, color.b]
                .map((x) => {
                  const hex = x.toString(16);
                  return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")}`}
              onChange={(e) => {
                const hex = e.target.value.replace("#", "");
                setColor({
                  r: parseInt(hex.substring(0, 2), 16),
                  g: parseInt(hex.substring(2, 4), 16),
                  b: parseInt(hex.substring(4, 6), 16),
                });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default PenTool;
