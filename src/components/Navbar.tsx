import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, LogOut, Home as HomeIcon, Building2, PlusCircle, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, isOwner } = useUserRole();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">KÈSO</span>
            <span className="hidden text-sm text-muted-foreground sm:inline">Imóveis</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              Início
            </Link>
            <Link to="/imoveis" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Imóveis
            </Link>
            <Link to="/planos" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Star className="h-4 w-4" />
              Planos
            </Link>
            {isOwner && (
              <>
                <Link to="/anunciar" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Anunciar
                </Link>
                <Link to="/meus-imoveis" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Meus Imóveis
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/perfil" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/cadastro">Cadastrar</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-card">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link
              to="/"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/imoveis"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Imóveis
            </Link>
            <Link
              to="/planos"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Planos
            </Link>
            {isOwner && (
              <>
                <Link
                  to="/anunciar"
                  className="block py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Anunciar Imóvel
                </Link>
                <Link
                  to="/meus-imoveis"
                  className="block py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Meus Imóveis
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}

            {user ? (
              <div className="space-y-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/perfil" onClick={() => setIsOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    Perfil
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Entrar
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/cadastro" onClick={() => setIsOpen(false)}>
                    Cadastrar
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
