import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eraser, Check } from "lucide-react";

interface SignaturePadProps {
  onSave: (signature: string) => void;
  value?: string;
}

export function SignaturePad({ onSave, value }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(!!value);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsSigned(false);
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      return;
    }
    const signature = sigCanvas.current?.toDataURL();
    if (signature) {
      onSave(signature);
      setIsSigned(true);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Assinatura Digital</Label>
      <Card className="p-4">
        {value && isSigned ? (
          <div className="space-y-4">
            <img src={value} alt="Assinatura" className="border rounded max-h-40" />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSigned(false)}
              className="w-full"
            >
              Refazer Assinatura
            </Button>
          </div>
        ) : (
          <>
            <div className="border rounded bg-white">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: "w-full h-40",
                }}
                backgroundColor="white"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={clear}
                className="flex-1"
              >
                <Eraser className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button
                type="button"
                onClick={save}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </>
        )}
      </Card>
      <p className="text-sm text-muted-foreground">
        Desenhe sua assinatura no espaço acima
      </p>
    </div>
  );
}