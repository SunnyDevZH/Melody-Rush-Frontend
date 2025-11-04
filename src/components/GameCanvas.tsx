import React, { useRef, useEffect } from 'react';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const scrollRef = useRef<number>(0);

  const COLUMNS = 4;
  const COLUMN_COLORS = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'];
  const SPEED = 2; // px/frame
  const TILE_HEIGHT = 80; // Höhe der sich bewegenden Segmente
  const TILE_GAP = 40; // Abstand zwischen Segmenten

  const draw = (ctx: CanvasRenderingContext2D) => {
    const columnWidth = width / COLUMNS;

    // Hintergrund
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#34495e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Spalten-Hintergründe und Separatoren
    for (let i = 0; i < COLUMNS; i++) {
      const x = i * columnWidth;

      // leicht transparente Spaltenfläche
      ctx.fillStyle = COLUMN_COLORS[i] + '20';
      ctx.fillRect(x, 0, columnWidth, height);

      // Separator-Linie zwischen Spalten
      if (i > 0) {
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Sich bewegende Segmente innerhalb jeder Spalte
      const cycle = TILE_HEIGHT + TILE_GAP;
      // Startversatz pro Spalte für ein abwechslungsreiches Muster
      const colOffset = (i * (cycle / COLUMNS)) % cycle;
      for (let y = -TILE_HEIGHT; y < height + TILE_HEIGHT; y += cycle) {
        const yPos = y + ((scrollRef.current + colOffset) % cycle);

        // Schatten
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(x + 4, yPos + 4, columnWidth - 8, TILE_HEIGHT);

        // Segment
        ctx.fillStyle = COLUMN_COLORS[i];
        ctx.fillRect(x + 2, yPos + 2, columnWidth - 8, TILE_HEIGHT);

        // Glanzlicht
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(x + 2, yPos + 2, columnWidth - 8, TILE_HEIGHT / 3);

        // Rand
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, yPos + 2, columnWidth - 8, TILE_HEIGHT);
      }
    }

    // Titel
    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 24px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('4 Spalten – kontinuierliche Abwärtsbewegung', width / 2, 36);
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update
    scrollRef.current += SPEED;

    // Draw
    draw(ctx);

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Erste Zeichnung
    const ctx = canvas.getContext('2d');
    if (ctx) draw(ctx);

    // Start Animation
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        display: 'block',
        margin: '0 auto', // zentriert
        borderRadius: 12,
        border: '2px solid #34495e',
        background: '#2c3e50',
      }}
    />
  );
};

export { GameCanvas };
export default GameCanvas;
