
import { Platform } from "react-native";

export function clearErrorAfterDelay(errorKey: string) {
  console.log('Clearing error after delay:', errorKey);
}

export function sendErrorToParent(level: string, message: string, data?: any) {
  console.log(`[${level}] ${message}`, data);
}

export function extractSourceLocation(stack: string) {
  try {
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('at ') && !line.includes('node_modules')) {
        return line.trim();
      }
    }
    return 'Unknown location';
  } catch (e) {
    return 'Error extracting location';
  }
}

export function getCallerInfo() {
  try {
    const stack = new Error().stack || '';
    return extractSourceLocation(stack);
  } catch (e) {
    return 'Unknown caller';
  }
}

export function setupErrorLogging() {
  console.log('Setting up error logging...');
  
  // Global error handler
  if (Platform.OS !== 'web') {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      sendErrorToParent('error', args.join(' '));
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      sendErrorToParent('warn', args.join(' '));
    };
  }

  // Handle unhandled promise rejections
  if (typeof global !== 'undefined' && global.process) {
    global.process.on?.('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Promise Rejection:', reason);
      sendErrorToParent('error', `Unhandled Promise Rejection: ${reason}`);
    });
  }

  console.log('Error logging setup complete');
}
