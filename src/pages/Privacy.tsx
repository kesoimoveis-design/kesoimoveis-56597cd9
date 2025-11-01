import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl">Política de Privacidade</CardTitle>
            <p className="text-muted-foreground">Última atualização: Janeiro de 2025</p>
            <p className="text-sm text-muted-foreground mt-2">
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)
            </p>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">1. Compromisso com sua Privacidade</h2>
              </div>
              <p className="text-muted-foreground">
                A KÈSO Imóveis respeita sua privacidade e está comprometida em proteger seus dados pessoais. 
                Esta política descreve como coletamos, usamos, armazenamos e compartilhamos suas informações.
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">2. Dados Coletados</h2>
              </div>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Dados Fornecidos Diretamente</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Cadastro de usuário:</strong> Nome, e-mail, telefone</li>
                <li><strong>Anúncio de imóvel:</strong> Endereço, fotos, descrição, características</li>
                <li><strong>Contato:</strong> Nome e telefone de interessados em imóveis</li>
                <li><strong>Pagamento:</strong> Dados de transação (processados por gateway terceirizado)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Dados Coletados Automaticamente</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Cookies essenciais:</strong> Para manter sua sessão ativa</li>
                <li><strong>Logs de acesso:</strong> IP, navegador, páginas visitadas</li>
                <li><strong>Interações:</strong> Cliques, buscas, tempo de permanência</li>
              </ul>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">3. Finalidade do Uso dos Dados</h2>
              </div>
              <p className="text-muted-foreground mb-2">
                Utilizamos seus dados para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Intermediação imobiliária:</strong> Conectar proprietários e interessados</li>
                <li><strong>Comunicação:</strong> Enviar notificações sobre seus anúncios e interesses</li>
                <li><strong>Segurança:</strong> Prevenir fraudes e proteger a plataforma</li>
                <li><strong>Moderação:</strong> Verificar a autenticidade e adequação dos anúncios</li>
                <li><strong>Melhoria do serviço:</strong> Análise de uso para otimização da experiência</li>
                <li><strong>Cumprimento legal:</strong> Atender obrigações legais e regulatórias</li>
              </ul>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">4. Compartilhamento de Dados</h2>
              </div>
              <p className="text-muted-foreground mb-2">
                Seus dados podem ser compartilhados apenas nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong>Com interessados autenticados:</strong> Seu contato é compartilhado apenas com usuários 
                  cadastrados que demonstraram interesse no seu imóvel
                </li>
                <li>
                  <strong>Com prestadores de serviço:</strong> Empresas que nos auxiliam (hospedagem, pagamentos) 
                  sob acordos de confidencialidade
                </li>
                <li>
                  <strong>Por obrigação legal:</strong> Quando requerido por autoridades competentes
                </li>
                <li>
                  <strong>Com seu consentimento:</strong> Em outras situações, mediante sua autorização explícita
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Importante:</strong> NUNCA vendemos seus dados pessoais para terceiros.
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">5. Segurança dos Dados</h2>
              </div>
              <p className="text-muted-foreground mb-2">
                Implementamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Criptografia:</strong> Dados sensíveis são criptografados em trânsito (HTTPS/SSL)</li>
                <li><strong>Controle de acesso:</strong> Sistema de autenticação e autorização por níveis</li>
                <li><strong>Row-Level Security (RLS):</strong> Políticas de banco de dados que impedem acesso não autorizado</li>
                <li><strong>Backups regulares:</strong> Cópias de segurança para recuperação de dados</li>
                <li><strong>Monitoramento:</strong> Logs de acesso administrativo para auditoria</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground mb-2">
                De acordo com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Confirmação e acesso:</strong> Saber se processamos seus dados e acessá-los</li>
                <li><strong>Correção:</strong> Atualizar dados incompletos ou incorretos</li>
                <li><strong>Anonimização ou exclusão:</strong> Solicitar remoção de dados desnecessários</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
                <li><strong>Revogação de consentimento:</strong> Retirar autorização a qualquer momento</li>
                <li><strong>Oposição:</strong> Se opor ao tratamento realizado sem base legal adequada</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Para exercer seus direitos, entre em contato pelo WhatsApp: <strong>+55 11 95174-7705</strong>
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos seus dados pessoais enquanto:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Sua conta estiver ativa</li>
                <li>Necessário para cumprir obrigações legais (ex: documentos fiscais por 5 anos)</li>
                <li>Para resolver disputas e fazer cumprir acordos</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Após esse período, os dados são anonimizados ou excluídos de forma segura.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
              <p className="text-muted-foreground mb-2">
                Utilizamos cookies essenciais para:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Manter você autenticado durante a navegação</li>
                <li>Lembrar suas preferências (ex: modo escuro)</li>
                <li>Garantir a segurança da plataforma</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Você pode desabilitar cookies nas configurações do seu navegador, mas isso pode afetar 
                o funcionamento da plataforma.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Privacidade de Menores</h2>
              <p className="text-muted-foreground">
                Nossos serviços são destinados a maiores de 18 anos. Não coletamos intencionalmente dados 
                de menores de idade. Se tomarmos conhecimento de coleta inadvertida, os dados serão excluídos imediatamente.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Anúncios de Proprietários Diretos</h2>
              <p className="text-muted-foreground">
                Anúncios de proprietários diretos são claramente identificados e não passam pela mesma 
                verificação dos anúncios oficiais da KÈSO. Recomendamos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Verificar pessoalmente o imóvel</li>
                <li>Validar documentação com profissionais especializados</li>
                <li>Não realizar pagamentos antes da devida verificação legal</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Alterações nesta Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Mudanças significativas serão comunicadas 
                por e-mail ou notificação na plataforma. Recomendamos revisar esta página regularmente.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Encarregado de Dados (DPO)</h2>
              <p className="text-muted-foreground">
                Para questões relacionadas à proteção de dados, contate nosso encarregado:
              </p>
              <ul className="list-none pl-0 text-muted-foreground space-y-2 mt-4">
                <li><strong>WhatsApp:</strong> +55 11 95174-7705</li>
                <li><strong>Horário de atendimento:</strong> Segunda a Sexta, 9h às 18h</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                <strong>Resumo:</strong> Respeitamos sua privacidade, protegemos seus dados com tecnologia de ponta, 
                compartilhamos informações apenas quando necessário, e você tem controle total sobre seus dados 
                conforme garantido pela LGPD.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
