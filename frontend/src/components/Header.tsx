import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Moon, Sun } from "lucide-react";
import { fadeInUp, buttonTap, useMotionSafe } from "@/lib/motionSystem";

const Header = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const location = useLocation();
  const { shouldReduce } = useMotionSafe();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "How it works", path: "/how-it-works" },
    { name: "Tools", path: "/tools" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: shouldReduce ? 0.01 : 0.6 }}
      className="sticky top-0 z-50 backdrop-blur-lg bg-[var(--glass-bg)] border-b border-[var(--glass-border)] shadow-[var(--shadow-glass)]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={shouldReduce ? {} : { scale: 1.05 }}
              whileTap={shouldReduce ? {} : { scale: 0.95 }}
            >
              <Shield className="w-8 h-8 text-primary" />
            </motion.div>
            <span className="text-xl font-bold bg-[var(--gradient-teal-indigo)] bg-clip-text text-transparent">
              BioVault
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="relative">
                <motion.span
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  whileHover={shouldReduce ? {} : { scale: 1.05 }}
                >
                  {item.name}
                </motion.span>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleTheme}
              {...(shouldReduce ? {} : buttonTap)}
              whileHover={shouldReduce ? {} : { scale: 1.1 }}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </motion.button>

            <Link to="/login">
              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Login
              </motion.button>
            </Link>

            <Link to="/register">
              <motion.button
                {...(shouldReduce ? {} : buttonTap)}
                whileHover={shouldReduce ? {} : { scale: 1.02 }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Register
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;