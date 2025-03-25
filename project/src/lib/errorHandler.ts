import { captureException, init as initErrorTracking } from '@sentry/browser';

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  PAYMENT = 'PAYMENT',
  FILE_PROCESSING = 'FILE_PROCESSING',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface ErrorDetails {
  type: ErrorType;
  code?: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  context?: Record<string, any>;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private readonly errors: ErrorDetails[] = [];
  private readonly maxErrors = 100;

  private constructor() {
    // Initialize error tracking (e.g., Sentry)
    initErrorTracking({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.ERROR,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: ErrorType.UNKNOWN,
        severity: ErrorSeverity.ERROR,
      });
    });
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: Error, details: Partial<ErrorDetails> = {}): void {
    const errorDetails: ErrorDetails = {
      type: details.type || ErrorType.UNKNOWN,
      message: error.message,
      severity: details.severity || ErrorSeverity.ERROR,
      timestamp: Date.now(),
      context: {
        ...details.context,
        stack: error.stack,
        url: window.location.href,
      },
    };

    // Log error
    this.logError(errorDetails);

    // Track error
    this.trackError(error, errorDetails);

    // Show user feedback if needed
    if (errorDetails.severity === ErrorSeverity.ERROR || errorDetails.severity === ErrorSeverity.CRITICAL) {
      this.showUserFeedback(errorDetails);
    }
  }

  private logError(details: ErrorDetails): void {
    // Add to internal log
    this.errors.unshift(details);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // Console logging in development
    if (import.meta.env.DEV) {
      console.error('[Billit Error]:', details);
    }
  }

  private trackError(error: Error, details: ErrorDetails): void {
    captureException(error, {
      level: details.severity,
      tags: {
        type: details.type,
        code: details.code,
      },
      extra: details.context,
    });
  }

  private showUserFeedback(details: ErrorDetails): void {
    // Create and show error toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    
    const message = this.getUserFriendlyMessage(details);
    toast.textContent = message;
    
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  private getUserFriendlyMessage(details: ErrorDetails): string {
    switch (details.type) {
      case ErrorType.NETWORK:
        return 'Connection error. Please check your internet connection and try again.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Your session has expired. Please sign in again.';
      case ErrorType.PAYMENT:
        return 'Payment processing failed. Please try again or use a different payment method.';
      case ErrorType.FILE_PROCESSING:
        return 'Error processing your file. Please try again with a different file.';
      default:
        return 'Something went wrong. Please try again later.';
    }
  }

  public getErrors(): ErrorDetails[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors.length = 0;
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Utility function to wrap async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorType: ErrorType,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    errorHandler.handleError(error as Error, {
      type: errorType,
      severity,
      context,
    });
    throw error;
  }
}