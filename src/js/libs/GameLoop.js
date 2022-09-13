class GameLoop {
  constructor(updateFn) {
    this.lastTimestamp = 0;
    this.delta = 0;

    this.updateFn = updateFn;

    console.log(this, this.updateLoop);

    this.updateLoop = this.updateLoop.bind(this);

    this.updateLoop(0);
  }

  updateLoop(timestamp) {
    this.delta = timestamp - this.lastTimestamp;

    this.lastTimestamp = timestamp;

    this.deltaSeconds = this.delta / 1000;

    if (!this.paused && this.updateFn) this.updateFn(this.delta);

    this.requestId = requestAnimationFrame(this.updateLoop);
  }

  pause(value) {
    this.paused = (value !== undefined) ?
      value :
      !this.paused;
  }

  stop() {
    cancelAnimationFrame(this.requestId);
  }
}

export default GameLoop;

export const gameLoop = new GameLoop();
