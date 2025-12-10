export function formatDuration(start: number | null, end: number): string {
  if (start == null) return "0ms";

  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;

  const seconds = ms / 1000;
  return `${seconds.toFixed(2)}s`;
}

export function formatCount(count: number, singular: string): string {
  const label = count === 1 ? singular : `${singular}s`;
  return `${count} ${label}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} kB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}
