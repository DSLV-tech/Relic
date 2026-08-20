const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae'] as const;

/** Notazione abbreviata: 12.4K, 3.08M. Il cuore leggibile di ogni incremental. */
export const formatNumber = (value: number, digits = 2): string => {
  if (!Number.isFinite(value)) return '∞';
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs < 1_000) {
    return sign + (abs < 10 && abs % 1 !== 0 ? abs.toFixed(1) : Math.floor(abs).toString());
  }
  const tier = Math.min(Math.floor(Math.log10(abs) / 3), SUFFIXES.length - 1);
  const scaled = abs / Math.pow(1_000, tier);
  return `${sign}${scaled.toFixed(scaled < 100 ? digits : 0)}${SUFFIXES[tier]}`;
};

export const formatRate = (value: number): string => `${formatNumber(value, 1)}/s`;

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const formatPercent = (value: number, digits = 0): string =>
  `${(value * 100).toFixed(digits)}%`;
