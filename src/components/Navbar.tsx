
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 py-4",
        isScrolled 
          ? "bg-white/80 shadow-md backdrop-blur-md py-3" 
          : "bg-transparent"
      )}
    >
      <div className="container px-6 mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-playfair font-bold text-brand-red">
            Mystery Publishers
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="#features" className="font-medium text-secondary hover:text-primary transition-colors duration-200">Features</Link>
            <Link to="#how-it-works" className="font-medium text-secondary hover:text-primary transition-colors duration-200">How It Works</Link>
            <Link to="#roles" className="font-medium text-secondary hover:text-primary transition-colors duration-200">User Roles</Link>
            <Link to="#testimonials" className="font-medium text-secondary hover:text-primary transition-colors duration-200">Testimonials</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="bg-brand-red hover:bg-brand-red/90 transition-colors shadow-md" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
