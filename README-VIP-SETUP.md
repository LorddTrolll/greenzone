# GreenZone - Configuração do Sistema VIP

Este guia contém todas as instruções para configurar a integração completa entre Supabase e Stripe para o sistema VIP do GreenZone.

## 📋 Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Conta no Stripe (https://stripe.com)
- Node.js 18+ instalado
- Projeto Next.js configurado

## 🚀 Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com e crie um novo projeto
2. Anote a URL do projeto e as chaves de API
3. Vá para o SQL Editor no dashboard

### 2. Executar Script de Configuração

1. Abra o arquivo `supabase-setup.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Execute o script

Este script irá:
- Criar a tabela `profiles` com todos os campos necessários
- Configurar Row Level Security (RLS)
- Criar triggers automáticos para novos usuários
- Adicionar índices para performance
- Criar funções auxiliares

### 3. Configurar Autenticação OAuth (Google)

1. Vá para `Authentication > Providers` no dashboard
2. Habilite o provedor Google
3. Configure as credenciais OAuth:
   - Client ID do Google
   - Client Secret do Google
   - Redirect URL: `https://seu-projeto.supabase.co/auth/v1/callback`

## 💳 Configuração do Stripe

### 1. Criar Produtos e Preços

1. Acesse o dashboard do Stripe
2. Vá para `Products` e crie:
   - **Produto**: "GreenZone VIP"
   - **Preço Mensal**: R$ 30,00 (recorrente mensal)
   - **Preço Anual**: R$ 300,00 (recorrente anual)
3. Anote os IDs dos preços criados

### 2. Configurar Webhook

1. Vá para `Developers > Webhooks`
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/webhooks/stripe`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Anote o Webhook Secret

## 🔧 Configuração do Ambiente

### 1. Variáveis de Ambiente

Crie/atualize o arquivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua_chave_publica_do_stripe
STRIPE_SECRET_KEY=sua_chave_secreta_do_stripe
STRIPE_WEBHOOK_SECRET=seu_webhook_secret_do_stripe
STRIPE_PRICE_ID_MONTHLY=price_id_do_plano_mensal
STRIPE_PRICE_ID_ANNUAL=price_id_do_plano_anual

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=seu_secret_aleatorio_aqui
```

### 2. Instalar Dependências

```bash
npm install @supabase/ssr @stripe/stripe-js stripe
```

## 🧪 Testando o Sistema

### 1. Teste de Autenticação

1. Inicie o servidor: `npm run dev`
2. Acesse `http://localhost:3000/login`
3. Teste login com email/senha
4. Teste login com Google
5. Verifique se o perfil é criado automaticamente no Supabase

### 2. Teste de Assinatura VIP

1. Faça login no sistema
2. Acesse `/vip`
3. Clique em "Assinar" em um dos planos
4. Complete o checkout no Stripe (use cartão de teste)
5. Verifique se o webhook atualiza o status VIP
6. Confirme acesso às rotas VIP (`/jogos-do-dia`, `/relatorios`)

### 3. Cartões de Teste do Stripe

- **Sucesso**: 4242 4242 4242 4242
- **Falha**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

## 🔒 Controle de Acesso

### Rotas Públicas
- `/` (Dashboard básico)
- `/login`
- `/registro`

### Rotas Autenticadas
- `/historico`
- `/configuracoes`
- `/vip`

### Rotas VIP Exclusivas
- `/jogos-do-dia`
- `/relatorios`

## 📊 Estrutura da Tabela Profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,              -- ID do usuário (FK para auth.users)
  email TEXT UNIQUE NOT NULL,       -- Email do usuário
  name TEXT,                        -- Nome do usuário
  is_vip BOOLEAN DEFAULT FALSE,     -- Status VIP ativo
  plano TEXT,                       -- 'MONTHLY' ou 'ANNUAL'
  data_inicio TIMESTAMP,            -- Data de início da assinatura
  data_expiracao TIMESTAMP,         -- Data de expiração da assinatura
  stripe_customer_id TEXT,          -- ID do cliente no Stripe
  stripe_subscription_id TEXT,      -- ID da assinatura no Stripe
  created_at TIMESTAMP,             -- Data de criação
  updated_at TIMESTAMP              -- Data de atualização
);
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de CORS**: Verifique se a URL do webhook está correta
2. **Webhook não funciona**: Confirme se o endpoint está acessível publicamente
3. **Usuário não é criado**: Verifique se o trigger `on_auth_user_created` está ativo
4. **Acesso negado**: Confirme se as políticas RLS estão configuradas corretamente

### Logs Úteis

- Supabase: `Authentication > Logs`
- Stripe: `Developers > Logs`
- Next.js: Console do navegador e terminal

## 📝 Próximos Passos

1. Configurar domínio personalizado
2. Implementar testes automatizados
3. Configurar monitoramento de erros
4. Adicionar analytics de conversão
5. Implementar sistema de cupons de desconto

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do Supabase e Stripe
2. Consulte a documentação oficial
3. Teste em ambiente de desenvolvimento primeiro

---

**Importante**: Mantenha suas chaves de API seguras e nunca as commite no repositório!