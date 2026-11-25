import { ProxyRoute } from '../types';

export class ProxyRouter {
  /**
   * Validate local domain naming conventions (e.g. *.test or *.local).
   */
  static isValidLocalDomain(domain: string): boolean {
    const trimmed = domain.trim().toLowerCase();
    return (
      (trimmed.endsWith('.test') || trimmed.endsWith('.local') || trimmed.endsWith('.localhost')) &&
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(trimmed)
    );
  }

  /**
   * Create a new proxy route with SSL certificate status.
   */
  static createRoute(localDomain: string, targetPort: number, sslEnabled = true): ProxyRoute {
    return {
      id: `route-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      localDomain: localDomain.toLowerCase().trim(),
      targetPort,
      sslEnabled,
      certStatus: sslEnabled ? 'VALID' : 'SELF_SIGNED',
      createdAt: Date.now()
    };
  }

  /**
   * Resolve an incoming local domain to its target destination URL.
   */
  static resolveDestination(routes: ProxyRoute[], domain: string): string | null {
    const matched = routes.find((r) => r.localDomain === domain.toLowerCase().trim());
    if (!matched) return null;
    const protocol = matched.sslEnabled ? 'https' : 'http';
    return `${protocol}://localhost:${matched.targetPort}`;
  }
}
