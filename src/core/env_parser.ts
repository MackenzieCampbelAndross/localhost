export class EnvParser {
  /**
   * Parse .env file string into key-value dictionary.
   */
  static parse(rawEnv: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = rawEnv.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines and comment lines
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      // Strip surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (key) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Serialize key-value dictionary to .env file string.
   */
  static serialize(envVars: Record<string, string>): string {
    return Object.entries(envVars)
      .map(([key, value]) => {
        // Quote value if it contains spaces or special characters
        const needsQuotes = value.includes(' ') || value.includes('#') || value.includes('\n');
        const formattedValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
        return `${key}=${formattedValue}`;
      })
      .join('\n');
  }
}
