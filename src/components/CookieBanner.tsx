import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("keso-cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("keso-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("keso-cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="mx-auto max-w-4xl border-2 bg-card p-4 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold">🍪 Cookies e Privacidade</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Utilizamos cookies essenciais para garantir o funcionamento do site e melhorar sua experiência. 
              Ao continuar navegando, você concorda com nossa{" "}
              <Link to="/privacidade" className="underline hover:text-primary">
                Política de Privacidade
              </Link>{" "}
              e{" "}
              <Link to="/termos" className="underline hover:text-primary">
                Termos de Uso
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAccept} size="sm">
                Aceitar
              </Button>
              <Button onClick={handleDecline} variant="outline" size="sm">
                Recusar
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDecline}
            className="shrink-0"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
