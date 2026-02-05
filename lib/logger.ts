/**
 * Application logger utility
 * Uses structured logging with appropriate levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isDebugEnabled = process.env.DEBUG === 'true';

  /**
   * Format log message with metadata
   */
  private formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Debug logs - only in development with DEBUG=true
   */
  debug(message: string, meta?: LogMeta): void {
    if (this.isDevelopment && this.isDebugEnabled) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  /**
   * Info logs - general information
   */
  info(message: string, meta?: LogMeta): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, meta));
    }
    // In production, could send to external service (Sentry, LogRocket, etc.)
  }

  /**
   * Warning logs - non-critical issues
   */
  warn(message: string, meta?: LogMeta): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  /**
   * Error logs - critical issues that need attention
   */
  error(message: string, error?: Error | unknown, meta?: LogMeta): void {
    const errorMeta = error instanceof Error 
      ? { 
          message: error.message, 
          stack: this.isDevelopment ? error.stack : undefined,
          ...meta 
        }
      : meta;

    console.error(this.formatMessage('error', message, errorMeta));
    
    // In production, send to error tracking service
    if (!this.isDevelopment && typeof window === 'undefined') {
      // Server-side: Could integrate with Sentry here
      // Example: Sentry.captureException(error);
    }
  }

  /**
   * Log HTTP request
   */
  http(method: string, path: string, statusCode: number, duration?: number): void {
    const meta: LogMeta = { method, path, statusCode };
    if (duration) meta.duration = `${duration}ms`;

    if (statusCode >= 500) {
      this.error(`HTTP ${method} ${path} - ${statusCode}`, undefined, meta);
    } else if (statusCode >= 400) {
      this.warn(`HTTP ${method} ${path} - ${statusCode}`, meta);
    } else if (this.isDevelopment) {
      this.info(`HTTP ${method} ${path} - ${statusCode}`, meta);
    }
  }

  /**
   * Log API call to external service
   */
  api(service: string, operation: string, success: boolean, duration?: number): void {
    const meta: LogMeta = { service, operation, success };
    if (duration) meta.duration = `${duration}ms`;

    if (success) {
      this.info(`API call to ${service}.${operation} succeeded`, meta);
    } else {
      this.error(`API call to ${service}.${operation} failed`, undefined, meta);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// For backward compatibility, also export as default
export default logger;
