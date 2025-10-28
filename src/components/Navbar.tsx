import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Building2, User, Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">KÈSO</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">Imóveis</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          <Link to="/" className="flex items-center space-x-1 text-sm font-medium text-foreground transition-colors hover:text-primary">
            <Home className="h-4 w-4" />
            <span>Início</span>
          </Link>
          <Link to="/imoveis" className="flex items-center space-x-1 text-sm font-medium text-foreground transition-colors hover:text-primary">
            <Building2 className="h-4 w-4" />
            <span>Imóveis</span>
          </Link>
          <Link to="/anunciar" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
            Anunciar Imóvel
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center space-x-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">
              <User className="mr-2 h-4 w-4" />
              Entrar
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/cadastro">Cadastrar</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-card md:hidden">
          <div className="container space-y-3 py-4">
            <Link
              to="/"
              className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </Link>
            <Link
              to="/imoveis"
              className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building2 className="h-4 w-4" />
              <span>Imóveis</span>
            </Link>
            <Link
              to="/anunciar"
              className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Anunciar Imóvel
            </Link>
            <div className="flex space-x-2 pt-2">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link to="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
