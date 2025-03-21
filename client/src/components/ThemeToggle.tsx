import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /> : <Sun className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;