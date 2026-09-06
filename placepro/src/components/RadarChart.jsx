import React, { useEffect, useRef } from 'react';

export default function RadarChart({ assessmentData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    ctx.clearRect(0, 0, width, height);

    const categories = [
      { name: 'Programming', value: assessmentData?.technical || 85 },
      { name: 'Web Dev', value: 78 },
      { name: 'Databases', value: 72 },
      { name: 'Frameworks', value: 68 },
      { name: 'DevOps/Cloud', value: 60 },
      { name: 'Soft Skills', value: assessmentData?.soft || 82 },
      { name: 'Aptitude', value: assessmentData?.aptitude || 80 }
    ];
    const numSides = categories.length;

    // Draw concentric polygon grid
    for (let level = 1; level <= 5; level++) {
      const levelRadius = (radius / 5) * level;
      ctx.beginPath();
      for (let i = 0; i < numSides; i++) {
        const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw radial axis lines & labels
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < numSides; i++) {
      const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.stroke();

      const labelX = centerX + (radius + 24) * Math.cos(angle);
      const labelY = centerY + (radius + 18) * Math.sin(angle);
      ctx.fillText(categories[i].name, labelX, labelY);
    }

    // Draw student data polygon
    ctx.beginPath();
    for (let i = 0; i < numSides; i++) {
      const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
      const valRadius = radius * (categories[i].value / 100);
      const x = centerX + valRadius * Math.cos(angle);
      const y = centerY + valRadius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Data points
    for (let i = 0; i < numSides; i++) {
      const angle = (Math.PI * 2 / numSides) * i - Math.PI / 2;
      const valRadius = radius * (categories[i].value / 100);
      const x = centerX + valRadius * Math.cos(angle);
      const y = centerY + valRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [assessmentData]);

  return (
    <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      <canvas
        ref={canvasRef}
        width={380}
        height={300}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}
