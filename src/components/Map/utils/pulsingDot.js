// utils/pulsingDot.js

export const createPulsingDot = (map) => {
  const size = 150; // Reduced size for cleaner edges

  const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    onAdd() {
      this.canvas = document.createElement('canvas');
      this.canvas.width = size;
      this.canvas.height = size;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    },
    render() {
      const duration = 2000;
      const t = (performance.now() % duration) / duration;

      const ease = (1 - t) ** 2; // Smooth easing
      const ctx = this.ctx;

      const innerRadius = size * 0.1;
      const outerRadius = size * 0.2 + (size * 0.2 * t); // Controlled pulse expansion

      ctx.clearRect(0, 0, size, size);

      // Outer fading pulse
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(30, 144, 255, ${0.3 * ease})`;
      ctx.fill();

      // Solid inner circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30,144,255,1)';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      this.data = ctx.getImageData(0, 0, size, size).data;
      map.triggerRepaint();
      return true;
    },
  };

  if (map.hasImage('pulsing-dot')) {
    map.removeImage('pulsing-dot');
  }

  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
};
