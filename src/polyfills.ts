// Browser polyfills for Node.js APIs
import { Buffer } from 'buffer';

// Make Buffer available globally for libraries that expect it
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
  (window as any).global = window;
}

export {};
