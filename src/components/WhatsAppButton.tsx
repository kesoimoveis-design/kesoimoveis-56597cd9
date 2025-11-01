import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const whatsappNumber = "5511951747705";
  const message = encodeURIComponent("Olá! Vim do site KÈSO Imóveis e gostaria de mais informações.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:bg-[#20BA5A]"
      aria-label="Falar no WhatsApp da KÈSO Imóveis"
      title="Fale conosco pelo WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
