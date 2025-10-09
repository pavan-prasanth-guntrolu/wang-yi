import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User, LogOut } from "lucide-react";
import NewLogo from "../../Graphics/Badge/Badge.png";
import RguktLogo from "../../Graphics/rgukt_logo.png";
import { useAuth } from "@/components/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // desktop
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null); // mobile
  const location = useLocation();
  const { user, signOut } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },

    {
      name: "Programs",
      dropdown: [
        { name: "Schedule", href: "/schedule" },
        { name: "Workshops", href: "/workshops" },
        { name: "Hackathon", href: "/hackathon" },
        { name: "ambassador", href: "/ambassador" },
        { name: "guest speaker", href: "/guest-speaker" },
        // { name: "accommodation", href: "/accommodation" },
      ],
    },
    {
      name: "Resources",
      dropdown: [
        { name: "Speakers", href: "/speakers" },
        { name: "Materials", href: "/materials" },
      ],
    },
    { name: "Sponsors", href: "/sponsors" },
    { name: "Our Team", href: "/team" }, // Swapped with Supporters
    { name: "Supporters", href: "/supporters" }, // Swapped with Our Team
    { name: "Refer", href: "/refer" },

    {
      name: "About Us",
      dropdown: [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
      ],
    },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 shadow-lg backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={RguktLogo} alt="RGUKT Logo" className="h-10 w-auto" />
            <img
              src={NewLogo}
              alt="Qiskit Fall Fest Logo"
              className="h-10 w-auto"
            />
            <span className="text-lg font-bold">Qiskit Fall Fest '25</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) =>
              item.dropdown ? (
                <div
                  key={item.name}
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={() => setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() =>
                      setOpenDropdown((prev) =>
                        prev === item.name ? null : item.name
                      )
                    }
                    className="flex items-center space-x-1 text-sm font-medium text-white hover:text-primary focus:outline-none"
                  >
                    <span>{item.name}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        openDropdown === item.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Transparent Dropdown with Blur */}
                  <AnimatePresence>
                    {openDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-2 min-w-[220px] bg-white/10 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-50 pt-2"
                      >
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2 text-sm text-white hover:bg-primary/10 hover:text-primary"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-white hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/register">
              <button className="btn-quantum px-4 py-2 text-primary-foreground rounded-lg shadow-md relative group animate-pulse-glow">
                <span className="relative z-10">Register</span>
                <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></span>
              </button>
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="btn-quantum px-4 py-2 text-primary-foreground rounded-lg shadow-md relative group animate-pulse-glow flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="relative z-10">Account</span>
                    <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <button className="btn-quantum px-4 py-2 text-primary-foreground rounded-lg shadow-md relative group animate-pulse-glow">
                  <span className="relative z-10">Sign In</span>
                  <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></span>
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full glass-card border border-white/20 hover:border-primary/50 shadow-md relative group"
          >
            <span className="relative z-10 text-primary">
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </span>
            <span className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"></span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-background border-t border-white/10 shadow-lg"
          >
            <nav className="flex flex-col space-y-4 p-4">
              {navigation.map((item) =>
                item.dropdown ? (
                  <div key={item.name} className="relative">
                    <button
                      onClick={() =>
                        setOpenMobileDropdown((prev) =>
                          prev === item.name ? null : item.name
                        )
                      }
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          openMobileDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {openMobileDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-4"
                        >
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-3 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              )}

              {
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full btn-quantum px-3 py-2 text-primary-foreground rounded-lg shadow-md relative group animate-pulse-glow">
                    <span className="relative z-10">Register</span>
                    <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  </button>
                </Link>
              }
              {user ? (
                <div className="space-y-2">
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-primary/10 hover:text-primary rounded-lg">
                      <User className="h-4 w-4" />
                      My Profile
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full btn-quantum px-3 py-2 text-primary-foreground rounded-lg shadow-md relative group animate-pulse-glow">
                    <span className="relative z-10">Sign In</span>
                    <span className="absolute inset-0 bg-white/10 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity"></span>
                  </button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
