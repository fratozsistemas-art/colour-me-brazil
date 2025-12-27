# 🔧 CI/CD Setup Guide

Este documento explica como configurar os workflows de CI/CD no GitHub Actions.

---

## 📋 Pré-requisitos

1. Repositório no GitHub
2. Conta em uma plataforma de deploy (Vercel/Netlify/Cloudflare)
3. Permissões de admin no repositório

---

## 🔐 Secrets Necessários

Configure estes secrets em: **Settings > Secrets and variables > Actions > New repository secret**

### Para Vercel (Recomendado):

```bash
VERCEL_TOKEN          # Token de autenticação da Vercel
VERCEL_ORG_ID         # ID da organização Vercel
VERCEL_PROJECT_ID     # ID do projeto Vercel
```

**Como obter:**

1. **VERCEL_TOKEN:**
   ```bash
   # Acesse: https://vercel.com/account/tokens
   # Clique em "Create Token"
   # Nome: "GitHub Actions CI/CD"
   # Scope: Full Account
   # Copie o token gerado
   ```

2. **VERCEL_ORG_ID e VERCEL_PROJECT_ID:**
   ```bash
   # Instale Vercel CLI:
   npm install -g vercel
   
   # Faça login:
   vercel login
   
   # Link seu projeto:
   vercel link
   
   # Os IDs estarão em .vercel/project.json:
   cat .vercel/project.json
   # {
   #   "orgId": "seu_org_id_aqui",
   #   "projectId": "seu_project_id_aqui"
   # }
   ```

---

### Para Netlify (Alternativa):

```bash
NETLIFY_AUTH_TOKEN    # Token de autenticação Netlify
NETLIFY_SITE_ID       # ID do site Netlify
```

**Como obter:**

1. **NETLIFY_AUTH_TOKEN:**
   ```bash
   # Acesse: https://app.netlify.com/user/applications
   # Clique em "New access token"
   # Copie o token gerado
   ```

2. **NETLIFY_SITE_ID:**
   ```bash
   # No dashboard do Netlify:
   # Site settings > General > Site details > Site ID
   ```

---

### Para Cloudflare Pages (Alternativa):

```bash
CLOUDFLARE_API_TOKEN     # Token de API Cloudflare
CLOUDFLARE_ACCOUNT_ID    # ID da conta Cloudflare
```

**Como obter:**

1. **CLOUDFLARE_API_TOKEN:**
   ```bash
   # Acesse: https://dash.cloudflare.com/profile/api-tokens
   # Clique em "Create Token"
   # Use template "Edit Cloudflare Pages"
   # Copie o token gerado
   ```

2. **CLOUDFLARE_ACCOUNT_ID:**
   ```bash
   # Dashboard Cloudflare > Workers & Pages
   # URL terá formato: https://dash.cloudflare.com/ACCOUNT_ID/...
   ```

---

### Opcionais (para features extras):

```bash
CODECOV_TOKEN         # Para cobertura de testes (https://codecov.io)
SNYK_TOKEN           # Para scan de segurança (https://snyk.io)
SLACK_WEBHOOK        # Para notificações Slack
DISCORD_WEBHOOK      # Para notificações Discord
```

---

## 🚀 Habilitar Workflows

### 1. Habilitar GitHub Actions

```bash
# No repositório GitHub:
Settings > Actions > General > Actions permissions
> Selecionar: "Allow all actions and reusable workflows"
> Salvar
```

### 2. Configurar Workflow Permissions

```bash
Settings > Actions > General > Workflow permissions
> Selecionar: "Read and write permissions"
> Marcar: "Allow GitHub Actions to create and approve pull requests"
> Salvar
```

### 3. Commit e Push dos Workflows

```bash
git add .github/workflows/
git commit -m "ci: add GitHub Actions workflows"
git push origin main
```

---

## ✅ Verificar Funcionamento

### 1. Verificar Workflows Ativados

```bash
# Acesse: Actions tab no GitHub
# Você verá: CI/CD Pipeline, Deploy to Production
```

### 2. Testar CI Pipeline

```bash
# Faça qualquer commit:
git commit --allow-empty -m "test: trigger CI"
git push origin main

# Acesse Actions tab
# Você verá o workflow rodando
```

### 3. Verificar Logs

```bash
# No Actions tab, clique no workflow
# Veja os logs de cada job:
# - Lint Code
# - Run Tests
# - Build Application
# - Deploy Production
```

---

## 🔄 Workflows Disponíveis

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push para `main` ou `develop`
- Pull Requests para `main`

**Jobs:**
- **Lint**: ESLint
- **Test**: Vitest + Coverage
- **Build**: Production build
- **Lighthouse**: Performance testing
- **Deploy Preview**: Deploy de PRs
- **Deploy Production**: Deploy automático
- **Security Scan**: npm audit + Snyk

**Duração:** ~5-10 minutos

---

### 2. Deploy to Production (`deploy.yml`)

**Triggers:**
- Push para `main`
- Tags `v*.*.*`
- Manual (workflow_dispatch)

**Jobs:**
- **Deploy Vercel**: Deploy principal
- **Deploy Netlify**: Alternativa (disabled)
- **Deploy Cloudflare**: Alternativa (disabled)
- **Notify**: Notificações Slack/Discord

**Duração:** ~3-5 minutos

---

## 🎯 Estratégia de Deploy

### Branch Strategy:

```
main (produção)
  ↑
develop (staging)
  ↑
feature/* (preview deploys)
```

### Deploy Flow:

```bash
# 1. Desenvolver em feature branch
git checkout -b feature/new-feature
git commit -am "feat: add new feature"
git push origin feature/new-feature

# 2. Criar PR → Deploy Preview automático
# GitHub cria URL de preview

# 3. Merge para develop → Deploy Staging
git checkout develop
git merge feature/new-feature
git push origin develop

# 4. Merge para main → Deploy Production
git checkout main
git merge develop
git push origin main
```

---

## 🐛 Troubleshooting

### Erro: "Resource not accessible by integration"

**Causa:** GitHub App não tem permissão 'workflows'

**Solução:**
```bash
Settings > Actions > General > Workflow permissions
> Selecionar: "Read and write permissions"
```

---

### Erro: "Invalid vercel token"

**Causa:** Token Vercel incorreto ou expirado

**Solução:**
```bash
# Gere novo token em https://vercel.com/account/tokens
# Atualize secret VERCEL_TOKEN no GitHub
```

---

### Erro: "Build failed"

**Causa:** Dependências ou build com erro

**Solução:**
```bash
# Teste localmente:
npm ci
npm test
npm run build

# Se funcionar local, problema é com environment variables
# Configure VITE_* secrets no GitHub
```

---

### Workflow não está rodando

**Causa:** Workflows desabilitados ou falta de permissões

**Solução:**
```bash
# 1. Verificar se Actions está habilitado
Settings > Actions > General

# 2. Verificar se workflow tem sintaxe correta
# Use: https://rhysd.github.io/actionlint/

# 3. Verificar se push foi para branch correta
git branch --show-current
```

---

## 📊 Monitoramento

### Badges no README

Adicione ao `README.md`:

```markdown
![CI/CD](https://github.com/fratozsistemas-art/colour-me-brazil/workflows/CI%2FCD%20Pipeline/badge.svg)
![Deploy](https://github.com/fratozsistemas-art/colour-me-brazil/workflows/Deploy%20to%20Production/badge.svg)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
[![Vercel](https://img.shields.io/badge/deployed-vercel-black)](https://colourmebrazil.vercel.app)
```

### Notificações

Configure webhooks para:
- ✅ Slack: Notificações de deploy
- ✅ Discord: Status de build
- ✅ Email: Falhas de deploy

---

## 🎉 Pronto!

Seu CI/CD está configurado! Agora a cada push:

1. ✅ Testes rodam automaticamente
2. ✅ Build é verificado
3. ✅ Deploy acontece automaticamente
4. ✅ Notificações são enviadas

**URLs de Deploy:**
- **Production:** `https://colourmebrazil.vercel.app`
- **Staging:** `https://colourmebrazil-staging.vercel.app`
- **PR Previews:** `https://colourmebrazil-pr-123.vercel.app`

---

## 📚 Recursos Adicionais

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments)
- [Netlify Deployment](https://docs.netlify.com/site-deploys/overview/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

---

**Última Atualização:** 2025-12-27  
**Versão:** 1.0.0
