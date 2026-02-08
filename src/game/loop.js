export function startLoop({ onTick }) {
  let lastTime = performance.now();
  let running = true;

  const frame = (time) => {
    if (!running) {
      return;
    }
    const delta = Math.min((time - lastTime) / 1000, 0.25);
    lastTime = time;
    onTick(delta);
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);

  return () => {
    running = false;
  };
}
