
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};
