import { NetworkError, ApiError } from './api';
import { useOfflineDetection } from '@/src/hooks/useOfflineDetection';

export interface OfflineErrorContext {
  isOffline: boolean;
  offlineMode: 'online' | 'network-offline' | 'server-offline';
  hasCachedData: boolean;
  canRetry: boolean;
  suggestedAction: string;
}

export interface OfflineErrorSuggestion {
  title: string;
  message: string;
  actions: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

/**
 * Offline error handler
 * Provides user-friendly error messages and suggestions for offline scenarios
 */
export class OfflineErrorHandler {
  /**
   * Get enhanced error context for an error
   */
  static getErrorContext(error: unknown): OfflineErrorContext {
    const isNetworkError = error instanceof NetworkError;
    const isApiError = error instanceof ApiError;
    
    // Get offline detection state (this would need to be called from a component)
    // For now, we'll provide basic context
    return {
      isOffline: isNetworkError,
      offlineMode: isNetworkError ? 'network-offline' : 'online',
      hasCachedData: this.hasCachedData(),
      canRetry: isNetworkError || (isApiError && this.isRetryableError(error as ApiError)),
      suggestedAction: this.getSuggestedAction(error),
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof NetworkError) {
      return 'Unable to connect to the server. You are currently working in offline mode.';
    }

    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Server error occurred. Please try again later.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred.';
  }

  /**
   * Get suggested action for the error
   */
  static getSuggestedAction(error: unknown): string {
    if (error instanceof NetworkError) {
      return 'Check your internet connection and try again, or continue working in offline mode.';
    }

    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          return 'Please log in again to continue.';
        case 403:
          return 'Contact your administrator if you believe you should have access.';
        case 404:
          return 'The resource may have been moved or deleted.';
        case 429:
          return 'Please wait a few moments before trying again.';
        case 500:
          return 'Try again later or contact support if the problem persists.';
        default:
          return 'Try again or contact support if the problem persists.';
      }
    }

    return 'Try again or contact support if the problem persists.';
  }

  /**
   * Get detailed error suggestions with actions
   */
  static getErrorSuggestions(error: unknown, context?: Partial<OfflineErrorContext>): OfflineErrorSuggestion {
    if (error instanceof NetworkError) {
      return {
        title: 'Connection Unavailable',
        message: 'The server cannot be reached. You can continue working in offline mode, or try to reconnect.',
        actions: [
          {
            label: 'Continue Offline',
            action: () => {
              // Continue with cached data
              console.log('Continuing in offline mode');
            },
            primary: false,
          },
          {
            label: 'Retry Connection',
            action: () => {
              // Retry the failed operation
              window.location.reload();
            },
            primary: true,
          },
        ],
      };
    }

    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          return {
            title: 'Session Expired',
            message: 'Your session has expired. Please log in again to continue.',
            actions: [
              {
                label: 'Log In Again',
                action: () => {
                  window.location.href = '/login';
                },
                primary: true,
              },
            ],
          };
        case 403:
          return {
            title: 'Access Denied',
            message: 'You do not have permission to perform this action.',
            actions: [
              {
                label: 'Go Back',
                action: () => {
                  window.history.back();
                },
                primary: true,
              },
            ],
          };
        default:
          return {
            title: 'Error Occurred',
            message: this.getUserMessage(error),
            actions: [
              {
                label: 'Try Again',
                action: () => {
                  window.location.reload();
                },
                primary: true,
              },
              {
                label: 'Go Back',
                action: () => {
                  window.history.back();
                },
                primary: false,
              },
            ],
          };
      }
    }

    return {
      title: 'Error',
      message: this.getUserMessage(error),
      actions: [
        {
          label: 'Try Again',
          action: () => {
            window.location.reload();
          },
          primary: true,
        },
      ],
    };
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: ApiError): boolean {
    // Retryable status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  /**
   * Check if cached data is available
   */
  static hasCachedData(): boolean {
    // This would need to check IndexedDB for cached data
    // For now, return true as a placeholder
    return true;
  }

  /**
   * Log error for debugging
   */
  static logError(error: unknown, context?: Record<string, unknown>): void {
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
    };

    console.error('Offline Error:', errorInfo);

    // In production, you might want to send this to a logging service
    // if the network is available
  }

  /**
   * Handle error with user feedback
   */
  static handleError(error: unknown, options?: {
    showUserMessage?: boolean;
    logError?: boolean;
    context?: Record<string, unknown>;
  }): {
    userMessage: string;
    suggestions: OfflineErrorSuggestion;
    shouldRetry: boolean;
  } {
    if (options?.logError !== false) {
      this.logError(error, options?.context);
    }

    return {
      userMessage: this.getUserMessage(error),
      suggestions: this.getErrorSuggestions(error),
      shouldRetry: error instanceof NetworkError || (error instanceof ApiError && this.isRetryableError(error)),
    };
  }
}

/**
 * Hook for handling errors in React components
 */
export function useOfflineErrorHandler() {
  const { mode, isOffline, checkServerStatus } = useOfflineDetection();

  const handleError = (error: unknown, options?: {
    onError?: (message: string, suggestions: OfflineErrorSuggestion) => void;
    context?: Record<string, unknown>;
  }) => {
    const result = OfflineErrorHandler.handleError(error, {
      logError: true,
      context: {
        ...options?.context,
        offlineMode: mode,
        isOffline,
      },
    });

    if (options?.onError) {
      options.onError(result.userMessage, result.suggestions);
    }

    return result;
  };

  const retryConnection = async () => {
    await checkServerStatus();
  };

  return {
    handleError,
    retryConnection,
    isOffline,
    offlineMode: mode,
  };
}