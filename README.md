# GymFlow

App pessoal de gestão de treinos (React + Vite + Firebase), inspirado no MFIT Personal.

## Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar o Firebase
1. Crie um projeto em https://console.firebase.google.com
2. **Authentication** → Sign-in method → ative **Email/Senha**
3. **Firestore Database** → crie o banco (modo produção)
4. Em **Regras** do Firestore, cole o conteúdo de `firestore.rules` (raiz do projeto) e publique
5. Em **Configurações do projeto → Seus apps**, crie um app Web e copie as credenciais
6. Cole as credenciais em `src/firebase/config.js` (substituindo os valores `SUA_API_KEY` etc.)

### 3. Rodar localmente
```bash
npm run dev
```

## Deploy na Vercel

O projeto já vem com `vercel.json` pronto (build via Vite, SPA fallback, headers de cache corretos
pro service worker sempre buscar a versão mais nova). Passos:

1. Suba o projeto pra um repositório Git (GitHub/GitLab/Bitbucket)
2. Na Vercel: **New Project** → importe o repositório → framework é detectado como **Vite** automaticamente
3. Configure as variáveis/credenciais do Firebase (se preferir não deixar hardcoded em `src/firebase/config.js`,
   dá pra migrar pra `import.meta.env.VITE_...` e cadastrar em **Project Settings → Environment Variables** na Vercel)
4. Deploy. Pronto — o domínio `*.vercel.app` (ou seu domínio próprio) já serve o app com PWA habilitado

⚠️ PWA (service worker, `beforeinstallprompt`) só funciona em **HTTPS** — a Vercel já serve tudo em HTTPS por padrão, então funciona sem configuração extra.

## PWA — instalação como app nativo

- O app é instalável (manifest + service worker com precache via Workbox, `registerType: autoUpdate`)
- No Android/Desktop (Chrome/Edge), aparece automaticamente um banner "Instalar GymFlow" dentro do app;
  também dá pra instalar pelo menu do navegador (ícone de instalação na barra de endereço)
- No iOS (Safari não expõe `beforeinstallprompt`), o banner mostra a instrução manual:
  Compartilhar → "Adicionar à Tela de Início"
- Uma vez instalado, abre em tela cheia (`display: standalone`), sem barra de navegador, com ícone e splash próprios

## Como funciona

- **Login/Cadastro**: primeira tela pede nome, email e senha. Depois de criar a conta, você fica logado permanentemente (até clicar em "Sair" no menu do avatar, canto superior esquerdo).
- **Rotinas**: conjuntos de treinos (ex: "Musculação", "Cardio"). Troque a rotina ativa pelo botão "⇄ ROTINA" no topo.
- **Treinos**: cada treino tem um título e um pool de exercícios. Você pode marcar "sortear automaticamente" para que o app monte o treino do dia cobrindo os subgrupos musculares definidos (ex: Deltoide anterior/lateral/posterior).
- **Banco de exercícios**: já vem com ~85 exercícios padrão taggeados por grupo/subgrupo muscular. Você pode adicionar os seus na aba "Exercícios".
- **Treino ativo**: Iniciar treino → preencher séries (reps/peso) ou dados de cardio (tempo/km/pace) → Finalizar (salva no calendário) ou Anular (descarta, ex: em caso de clique errado).
- **Estatísticas**: calendário com as datas de treino marcadas (toque numa data para ver detalhes) e Ranking (frequência de cada treino por período, ou ranking de corridas/pedaladas por km/pace).

## Estrutura do projeto

```
src/
  firebase/       - config, auth helpers, camada Firestore (db.js)
  contexts/       - AuthContext (autenticação) e DataContext (rotinas/exercícios/histórico)
  data/           - banco de exercícios padrão + taxonomia de grupos musculares
  utils/          - gerador inteligente de treino, uid
  components/ui/  - componentes reaproveitáveis (Card, Button, Tag, Calendar, Overlay...)
  views/          - telas do app (Auth, Home, ActiveWorkout, Routines, Exercises, Stats)
```

## Multi-usuário

O app já está preparado para múltiplas contas: cada usuário só enxerga seus próprios dados,
isolados em `users/{uid}/...` no Firestore, protegido pelas regras de segurança.
