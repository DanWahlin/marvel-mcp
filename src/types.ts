// MCP logging levels array (ordered from least to most severe)
export const LOG_LEVELS = ['debug', 'info', 'notice', 'warning', 'error', 'critical', 'alert', 'emergency'] as const;

// MCP logging level type derived from array
export type LogLevel = typeof LOG_LEVELS[number];