import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * Custom hook for managing dark/light theme
 * @returns {[string, Function]} - [theme, setTheme]
 */
export default function useTheme() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes
    root.classList.remove('light', 'dark');
    
    // Add current theme
    root.classList.add(theme);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#1A252F' : '#FF6B35'
      );
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return [theme, setTheme, toggleTheme];
}
