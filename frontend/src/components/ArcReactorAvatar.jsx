import { useEffect, useRef } from 'react';

export default function ArcReactorAvatar({ isSpeaking, isListening }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let animationId;
    let rotation = 0;
    let pulse = 0;

    const drawReactor = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Rotation and pulse
      rotation += 0.02;
      pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;

      // Outer glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
      if (isSpeaking) {
        gradient.addColorStop(0, 'rgba(0, 150, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 100, 200, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 50, 150, 0)');
      } else if (isListening) {
        gradient.addColorStop(0, 'rgba(0, 255, 100, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 200, 100, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 150, 50, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(50, 150, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 100, 200, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Core circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 30 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking ? '#0096FF' : isListening ? '#00FF64' : '#64C8FF';
      ctx.fill();
      ctx.strokeStyle = isSpeaking ? '#00D4FF' : isListening ? '#00FF96' : '#96E0FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating rings
      for (let i = 0; i < 3; i++) {
        const radius = 40 + i * 15;
        const segmentCount = 8;
        
        for (let j = 0; j < segmentCount; j++) {
          const angle = (Math.PI * 2 / segmentCount) * j + rotation + (i * 0.5);
          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle + 0.3) * radius;
          const y2 = centerY + Math.sin(angle + 0.3) * radius;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, angle, angle + 0.3);
          ctx.strokeStyle = isSpeaking 
            ? `rgba(0, 150, 255, ${0.8 - i * 0.2})` 
            : isListening
            ? `rgba(0, 255, 100, ${0.8 - i * 0.2})`
            : `rgba(100, 200, 255, ${0.6 - i * 0.2})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      // Energy particles
      if (isSpeaking || isListening) {
        for (let i = 0; i < 20; i++) {
          const particleAngle = (Math.PI * 2 / 20) * i + rotation * 2;
          const particleRadius = 60 + Math.sin(Date.now() / 300 + i) * 20;
          const px = centerX + Math.cos(particleAngle) * particleRadius;
          const py = centerY + Math.sin(particleAngle) * particleRadius;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = isSpeaking ? '#00D4FF' : '#00FF96';
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(drawReactor);
    };

    drawReactor();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isSpeaking, isListening]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="mx-auto"
    />
  );
}
