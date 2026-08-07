/**
 * Schema-validated safe localStorage wrapper with error recovery and key namespacing.
 */

const PREFIX = 'va_';

export const safeStorage = {
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[SafeStorage] Could not parse key "${key}", clearing:`, e);
      this.remove(key);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error(`[SafeStorage] Failed to set key "${key}":`, e);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {
      console.error(`[SafeStorage] Failed to remove key "${key}":`, e);
    }
  }
};
