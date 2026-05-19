import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme";
import { Button } from "./button";

export function ThemeToggle() {
  const { mode, toggleTheme } = useTheme();

  const icon =
    mode === "system"
      ? <Monitor className="size-4" />
      : mode === "light"
        ? <Sun className="size-4" />
        : <Moon className="size-4" />;

  const label = mode === "system" ? "System" : mode === "light" ? "Light" : "Dark";
  const nextLabel = mode === "system" ? "light" : mode === "light" ? "dark" : "system";

  return (
    <Button
      aria-label={`Switch theme mode to ${nextLabel}`}
      icon={icon}
      onClick={toggleTheme}
      type="button"
      variant="ghost"
    >
      {label}
    </Button>
  );
}
