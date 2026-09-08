import React, { useEffect, useRef } from 'react';

export default function PlacementBarChart({ departmentData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const data = departmentData && departmentData.length > 0
      ? departmentData.map((d) => ({
          label: d.department || d.label,
          rate: Math.round(d.rate !== undefined ? d.rate : ((d.placed / Math.max(1, d.total)) * 100))
        }))
      : [
          { label: 'CSE', rate: 96 },
          { label: 'IT', rate: 92 },
          { label: 'ECE', rate: 88 },
          { label: 'Mech', rate: 78 },
          { label: 'Civil', rate: 74 }
        ];

    const barWidth = 40;
    const gap = 36;
    const startX = 50;
    const maxHeight = canvas.height - 60;

    data.forEach((item, index) => {
      const x = startX + index * (barWidth + gap);
      const h = (item.rate / 100) * maxHeight;
      const y = canvas.height - 30 - h;

      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, '#6366f1');
      grad.addColorStop(1, '#06b6d4');

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, h, [6, 6, 0, 0]);
      } else {
        ctx.rect(x, y, barWidth, h);
      }
      ctx.fill();

      // Percent text on top
      ctx.fillStyle = '#f8fafc';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.rate}%`, x + barWidth / 2, y - 8);

      // Label below
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(item.label, x + barWidth / 2, canvas.height - 10);
    });
  }, [departmentData]);

  return (
    <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        width={480}
        height={260}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}
