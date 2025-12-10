const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export interface Spinner {
  start(text: string): void;
  stop(): void;
  setText(text: string): void;
}

export const createSpinner = (): Spinner => {
  let text = "";
  let frameIndex = 0;
  let timer: NodeJS.Timeout | null = null;
  let isRunning = false;

  const render = () => {
    const frame = frames[frameIndex];
    frameIndex = (frameIndex + 1) % frames.length;
    const output = `${frame} ${text}`;
    process.stdout.write(`\r\x1b[2K${output}`);
  };

  const start = (initialText: string) => {
    if (isRunning) return;
    text = initialText;
    isRunning = true;
    render();
    timer = setInterval(render, 80);
  };

  const stop = () => {
    if (!isRunning) return;
    isRunning = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    process.stdout.write("\r\x1b[2K");
  };

  const setText = (newText: string) => {
    text = newText;
  };

  return { start, stop, setText };
};
