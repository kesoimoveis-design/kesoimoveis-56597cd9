import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl">Termos de Uso</CardTitle>
            <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar e utilizar a plataforma KÈSO Imóveis, você concorda com estes Termos de Uso e nossa Política de Privacidade. 
                Se você não concorda com qualquer parte destes termos, não deve utilizar nossos serviços.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Descrição dos Serviços</h2>
              <p className="text-muted-foreground mb-2">
                A KÈSO Imóveis oferece uma plataforma digital que conecta:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Proprietários diretos:</strong> Pessoas físicas que desejam anunciar imóveis próprios</li>
                <li><strong>KÈSO Imóveis:</strong> Imobiliária com anúncios profissionais e verificados</li>
                <li><strong>Interessados:</strong> Pessoas buscando comprar ou alugar imóveis</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Responsabilidades</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Proprietários Diretos</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Devem fornecer informações verdadeiras e atualizadas sobre os imóveis</li>
                <li>São responsáveis pela veracidade de fotos, descrições e documentação</li>
                <li>Devem possuir todos os direitos legais sobre o imóvel anunciado</li>
                <li>Concordam que seus anúncios sejam submetidos à aprovação da KÈSO</li>
                <li>Compreendem que anúncios podem ser pausados ou removidos se violarem estas regras</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Usuários Interessados</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Devem verificar pessoalmente as condições do imóvel antes de fechar negócio</li>
                <li>São responsáveis por validar toda documentação apresentada</li>
                <li>Devem agir de boa-fé em todas as interações na plataforma</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Poder de Supervisão da KÈSO</h2>
              <p className="text-muted-foreground">
                A KÈSO Imóveis reserva-se o direito de:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Moderar conteúdo:</strong> Aprovar, rejeitar, editar ou remover qualquer anúncio</li>
                <li><strong>Suspender contas:</strong> Desativar usuários que violem os termos de uso</li>
                <li><strong>Acessar dados:</strong> Visualizar informações dos anúncios para fins de moderação e segurança</li>
                <li><strong>Verificar autenticidade:</strong> Solicitar documentação comprobatória de propriedade</li>
                <li><strong>Remover imagens inadequadas:</strong> Deletar fotos que não correspondam ao imóvel</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Planos e Pagamentos</h2>
              <p className="text-muted-foreground mb-2">
                Proprietários diretos podem escolher entre planos gratuitos e pagos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Planos pagos oferecem mais visibilidade e recursos adicionais</li>
                <li>Os valores são estabelecidos pela KÈSO e podem ser alterados mediante aviso prévio</li>
                <li>Pagamentos são processados por gateways terceirizados seguros</li>
                <li>Não há reembolso após ativação do plano, exceto em casos de falha técnica comprovada</li>
                <li>Anúncios expiram automaticamente após o período contratado</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Conteúdo Proibido</h2>
              <p className="text-muted-foreground mb-2">
                É estritamente proibido publicar:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Imóveis sobre os quais não possui direitos legais</li>
                <li>Informações falsas ou enganosas</li>
                <li>Fotos de terceiros sem autorização</li>
                <li>Conteúdo ofensivo, discriminatório ou ilegal</li>
                <li>Anúncios duplicados do mesmo imóvel</li>
                <li>Links para sites externos com fins comerciais não autorizados</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                A KÈSO Imóveis atua como intermediadora e não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Negociações e transações entre proprietários e interessados</li>
                <li>Veracidade das informações fornecidas por proprietários diretos</li>
                <li>Vícios ocultos ou problemas não declarados nos imóveis</li>
                <li>Danos resultantes de negócios realizados através da plataforma</li>
                <li>Problemas jurídicos relacionados à propriedade dos imóveis</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Importante:</strong> Anúncios de proprietários diretos são claramente identificados e 
                não passam pelo mesmo nível de verificação que os anúncios oficiais da KÈSO Imóveis.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                Todos os elementos da plataforma (design, código, logotipo, textos) são propriedade da KÈSO Imóveis 
                e protegidos por direitos autorais. É proibida a reprodução sem autorização prévia.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Alterações nos Termos</h2>
              <p className="text-muted-foreground">
                A KÈSO reserva-se o direito de modificar estes termos a qualquer momento. 
                Usuários serão notificados de mudanças significativas e o uso continuado da plataforma 
                constitui aceitação dos novos termos.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Lei Aplicável</h2>
              <p className="text-muted-foreground">
                Estes termos são regidos pelas leis da República Federativa do Brasil. 
                Disputas serão resolvidas no foro da comarca de São Paulo/SP.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas, sugestões ou denúncias, entre em contato:
              </p>
              <ul className="list-none pl-0 text-muted-foreground space-y-2 mt-4">
                <li><strong>WhatsApp:</strong> +55 11 95174-7705</li>
                <li><strong>Site:</strong> kesoimoveis.lovable.app</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground italic">
                Ao utilizar a plataforma KÈSO Imóveis, você reconhece ter lido, compreendido 
                e concordado com todos os termos acima descritos.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
