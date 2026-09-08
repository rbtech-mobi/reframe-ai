# ReframeIA 

> Aplicativo móvel para reinterpretação empática e calma de mensagens sociais ambíguas, desenvolvido com foco em acessibilidade cognitiva e neurodivergência (TEA - Transtorno do Espectro Autista).

---

##  Sobre o Projeto

O **ReframeIA** é uma tecnologia assistiva voltada para pessoas que enfrentam desafios na decodificação de subtextos sociais, entrelinhas, ironias ou tons em conversas digitais (como em aplicativos de mensagens ou e-mails corporativos). 

Em vez de atuar como um chatbot genérico, o aplicativo funciona como um **mediador cognitivo**:
- **Desmistifica a ambiguidade:** Oferece múltiplas leituras plausíveis e realistas para uma mesma mensagem, reduzindo o hiperfoco em conotações hostis ou rejeição.
- **Engenharia de prompt ética:** Não infere intenções ocultas como fatos absolutos, não diagnostica, não invalida sentimentos e não infantiliza o usuário.
- **Respostas práticas:** Gera sugestões de respostas calmas e neutras para ajudar na comunicação sem sobrecarga cognitiva.

---

##  Tecnologias & Arquitetura

O projeto foi desenvolvido obrigatoriamente para **Mobile** com **React Native** e ecossistema **Expo**, garantindo performance nativa, ergonomia tátil e total conformidade com diretrizes de acessibilidade.

- **Frontend Mobile:** React Native 0.81, Expo SDK 54, TypeScript (modo estrito, zero uso de `any`).
- **Design System:** Estética *Glassmorphism* escura (WCAG AA) com `expo-blur`, `expo-linear-gradient` e `@expo/vector-icons`.
- **Feedback Sensorial:** `expo-haptics` para respostas táteis e microinterações temporárias de confirmação visual.
- **Manipulação de Área de Transferência:** `expo-clipboard` para colar a mensagem de entrada e copiar a sugestão ou análise completa com um toque.
- **Camada de IA:** **Vercel AI SDK** (`ai` e `@ai-sdk/google`).
  > **Atenção:** O modelo utilizado é o **`gemini-3.5-flash-lite`** do Google, e **não** o Gemini 1.5. A integração utiliza a biblioteca aberta da Vercel para comunicação direta com a API do Google, sem necessidade de conta ou servidores intermediários da Vercel.

---

##  Fluxo Principal de Dados

```
[ Entrada do Usuário ] (MessageInput: digitação ou colagem rápida com haptics)
         │
         ▼
[ Validação & Estado ] (useReframe: bloqueio de mensagens vazias, máquina de estados)
         │
         ▼
[ Chamada à API de IA ] (generator.ts: Vercel AI SDK + Google gemini-3.5-flash-lite)
         │
         ▼
[ Parsing & Normalização ] (stripCodeFences + validação estrita do JSON estruturado)
         │
         ▼
[ Exibição Estruturada ] (ReframeResult: tom detectado + 3 leituras + resposta sugerida)
         │
         ▼
[ Ações Finais ] (Cópia independente da resposta, cópia da análise e botão "Nova Análise")
```

---

##  Estrutura do Repositório

```text
reframe-ia/
├── .github/
│   └── workflows/
│       └── ci.yml               # Pipeline de CI/CD (GitHub Actions: Typecheck & Tests)
├── assets/                      # Ícones e splash screen nativos
├── src/
│   ├── components/              # Componentes reutilizáveis de interface
│   │   ├── GlassCard.tsx        # Container com efeito glassmorphism e blur
│   │   ├── GradientBackground.tsx# Fundo em gradiente suave
│   │   ├── MessageInput.tsx     # Campo multiline com contador, botão colar e limpar
│   │   ├── PrimaryButton.tsx    # Botão tátil acessível (alvo mínimo de 44x44 pt)
│   │   └── ReframeResult.tsx    # Card de exibição estruturada e ações de cópia
│   ├── constants/               # Constantes e tokens de design
│   │   ├── colors.ts            # Paleta de cores WCAG AA
│   │   ├── prompts.ts           # Prompt do sistema (diretrizes éticas e schema JSON)
│   │   └── theme.ts             # Espaçamentos, raios e tipografia padronizados
│   ├── hooks/
│   │   └── useReframe.ts        # Hook de controle de estado (idle, loading, success, error)
│   ├── services/
│   │   └── generator.ts         # Integração com Gemini 3.5 Flash Lite via Vercel AI SDK
│   └── types/
│       └── index.ts             # Tipos TypeScript compartilhados
├── test/
│   ├── run-verification.js      # Runner de testes unitários para Node.js
│   └── verify-requirements.test.ts # Suite completa de requisitos e conformidade
├── App.tsx                      # Componente raiz da aplicação móvel
├── app.json                     # Configuração do Expo e metadados nativos
├── package.json                 # Dependências e scripts de execução
├── tsconfig.json                # Configuração estrita do TypeScript
└── .env.example                 # Exemplo de configuração de variáveis de ambiente
```

---

##  Configuração de Variáveis de Ambiente

O aplicativo lê a chave de API exclusivamente a partir de variáveis de ambiente gerenciadas pelo Expo:

1. Obtenha gratuitamente uma chave de API no [Google AI Studio](https://aistudio.google.com/).
2. Crie o arquivo `.env` na raiz do projeto a partir do modelo:
   ```bash
   cp .env.example .env
   ```
3. Defina a variável com a sua chave:
   ```env
   EXPO_PUBLIC_GOOGLE_API_KEY=sua_chave_aqui
   ```
> **Segurança:** O arquivo `.env` está estritamente adicionado ao `.gitignore` e nunca deve ser versionado no Git.

---

##  Como Executar o Projeto

### Pré-requisitos
- Node.js >= 20.x
- npm ou yarn
- Aplicativo **Expo Go** instalado no seu dispositivo móvel (iOS ou Android) ou emulador configurado.

### Passos
1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento do Metro:
   ```bash
   npm start
   ```

3. Abra o aplicativo:
   - **No celular físico:** Escaneie o QR Code exibido no terminal com o aplicativo Expo Go (Android) ou Câmera nativa (iOS).
   - **No emulador Android:** Pressione `a` no terminal.
   - **No simulador iOS:** Pressione `i` no terminal.

---

##  Qualidade de Código & Testes

O projeto conta com validações automatizadas abrangendo segurança, tipagem e requisitos de acessibilidade:

```bash
# Executa a suite de testes unitários automatizados (15 testes)
npm test

# Executa a checagem estrita de tipos com TypeScript (zero erros)
npm run typecheck
```

### Garantias de Qualidade Verificadas
- **Zero `console.log` residuais:** Código de produção limpo.
- **Zero uso de `any`:** 100% tipado estritamente.
- **Ergonomia e Acessibilidade:** Alvos de toque com área mínima de 44×44 pt, atributos `accessibilityLabel` e `accessibilityHint` em todos os botões interativos.
- **Sem Emojis na Interface:** Para manter a sobriedade, clareza e previsibilidade exigidas no contexto de suporte a neurodivergentes, ícones vetoriais da biblioteca Feather são utilizados no lugar de emojis.

---

## ⚙ Boas Práticas Git & CI/CD

- **Branches:** O projeto adota fluxo baseado em branches (`main` para produção/estável e `develop` para integração e desenvolvimento contínuo).
- **Conventional Commits:** Histórico com prefixos padronizados (`feat:`, `chore:`, `test:`, `docs:`, `ci:`).
- **GitHub Actions:** Pipeline automatizado em `.github/workflows/ci.yml` que valida a compilação do TypeScript (`npm run typecheck`) e roda a suite de testes (`npm test`) a cada `push` e `pull_request` nos branches `main` e `develop`.
