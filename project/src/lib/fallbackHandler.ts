import { errorHandler, ErrorType, ErrorSeverity } from './errorHandler';

interface FallbackOptions<T> {
  defaultValue?: T;
  maxAge?: number;
  key?: string;
}

export class FallbackHandler<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();

  constructor(private readonly options: FallbackOptions<T> = {}) {}

  async withFallback(
    operation: () => Promise<T>,
    fallbackOperation?: () => Promise<T>
  ): Promise<T> {
    const cacheKey = this.options.key || 'default';

    try {
      // Try primary operation
      const result = await operation();
      
      // Update cache
      this.cache.set(cacheKey, {
        value: result,
        timestamp: Date.now(),
      });
      
      return result;
    } catch (error) {
      // Log the error
      errorHandler.handleError(error as Error, {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.WARNING,
        context: { cacheKey },
      });

      // Try fallback operation if provided
      if (fallbackOperation) {
        try {
          return await fallbackOperation();
        } catch (fallbackError) {
          errorHandler.handleError(fallbackError as Error, {
            type: ErrorType.UNKNOWN,
            severity: ErrorSeverity.ERROR,
            context: { cacheKey, fallback: true },
          });
        }
      }

      // Try cached value
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.value;
      }

      // Use default value if available
      if (this.options.defaultValue !== undefined) {
        return this.options.defaultValue;
      }

      // No fallback available
      throw error;
    }
  }

  private isCacheValid(timestamp: number): boolean {
    if (!this.options.maxAge) return true;
    return Date.now() - timestamp < this.options.maxAge;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Create instances for common fallback scenarios
export const currencyFallback = new FallbackHandler<Record<string, number>>({
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  key: 'exchange_rates',
});

export const templateFallback = new FallbackHandler<any[]>({
  defaultValue: [],
  key: 'invoice_templates',
});