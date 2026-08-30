# ReframeIA

A React Native mobile application that assists neurodivergent users with mild ADHD and mild autism spectrum characteristics in reinterpreting ambiguous social messages through generative AI.

## Purpose

The system receives a message provided by the user and returns alternative interpretations with a neutral tone, a suggested reply, and the most probable emotional register.

The goal is to reduce impulsive reactions and social misunderstandings by offering a structured second reading of textual input.

## Technology Stack

* Runtime: React Native 0.81 with Expo SDK 54
* Language: TypeScript 5.9
* AI Provider: Google Gemini
* Model: `gemini-1.5-flash`
* SDK: Vercel AI SDK
* Packages: `ai`, `@ai-sdk/google`
* UI: `expo-blur`, `expo-linear-gradient`, `moti`, `react-native-reanimated`
* Storage: `@react-native-async-storage/async-storage`
* Utilities: `expo-clipboard`, `expo-haptics`, `react-native-safe-area-context`

## System Architecture

```text
+-------------------+         +--------------------+
|   User Interface  |         |   Local Storage    |
|   (app/index.tsx) | <-----> |   AsyncStorage     |
+---------+---------+         +--------------------+
          |
          v
+-------------------+
|   useReframe.ts   |     Custom hook
|                   |     State and I/O
+---------+---------+
          |
          v
+-------------------+
|   generator.ts    |     Service layer
+---------+---------+
          |
          v
+-------------------+
|  Vercel AI SDK    |
|  + Google Gemini  |
+-------------------+
```

## Data Flow

```text
[user input]
      |
      v
[validation]
      |
      v
[prompt assembly]
      |
      v
[Gemini API]
      |
      v
[structured response]
      |
      v
[JSON parse]
      |
      v
[render result]
      |
      v
[reset state]
```

## Project Layers

```text
Layer 1   Infrastructure    git, expo, environment variables
Layer 2   Dependencies      package installation
Layer 3   Folder structure  src/, components/, services/
Layer 4   Design system     color palette, glass style
Layer 5   UI components     input, button, result card
Layer 6   AI integration    Gemini via Vercel AI SDK
Layer 7   State management  React hooks and useState
Layer 8   Animations        Moti transitions
Layer 9   Accessibility     WCAG AA, haptics, labels
Layer 10  Testing           manual testing and edge cases
Layer 11  Code quality      linting, typing, comments
Layer 12  Documentation     README and prompt disclosure
Layer 13  Delivery          tag, merge, submission
```

## Folder Structure

```text
reframe-ia/
├── app/
│   ├── _layout.tsx
│   └── index.tsx
├── src/
│   ├── components/
│   │   ├── GlassCard.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── MessageInput.tsx
│   │   └── ReframeResult.tsx
│   ├── services/
│   │   └── generator.ts
│   ├── constants/
│   │   ├── colors.ts
│   │   └── prompts.ts
│   ├── hooks/
│   │   └── useReframe.ts
│   └── types/
│       └── index.ts
├── assets/
├── .env.example
├── app.json
└── package.json
```

## Installation

### Requirements

* Node.js 18 or newer
* npm
* Expo Go application
* Physical device or emulator

Clone the repository and install the dependencies:

```bash
git clone git@github.com:rbtech-mobi/reframe-ai.git
cd reframe-ai
npm install
```

Create the local environment file:

```bash
cp .env.example .env
```

Add a valid Gemini API key to `.env`:

```env
EXPO_PUBLIC_GOOGLE_API_KEY=your_key_here
```

The API key can be obtained through Google AI Studio.

## Execution

Start the Expo development server:

```bash
npx expo start
```

Scan the generated QR code with the Expo Go application or run the project using an available emulator.

## Environment Variables

The project uses environment variables for configuration.

```env
EXPO_PUBLIC_GOOGLE_API_KEY=your_key_here
```

Do not commit the `.env` file or any file containing a real API key.

## Git Workflow

The project follows a simple branch structure:

```text
main
 |
 +-- develop
       |
       +-- feature/*
```

`main` represents the production ready reference.

`develop` is used as the integration branch.

`feature/*` branches are used for isolated development tasks.

Commit messages follow the Conventional Commits convention:

```text
feat
fix
chore
docs
refactor
style
test
```

Example:

```bash
git add README.md
git commit -m "docs: add project README"
git push
```

## System Prompt

The prompt used to condition the model is disclosed in:

```text
src/constants/prompts.ts
```

The prompt instructs the model to:

1. Infer the most probable tone in a neutral manner.
2. Provide three gentle and realistic alternative interpretations.
3. Suggest a calm response.
4. Avoid unfounded romantic assumptions.
5. Avoid unfounded hostile assumptions.
6. Keep the interpretation grounded in the original message.

The prompt is intentionally documented as part of the project's transparency requirements.

## Security Considerations

The Gemini API key is loaded from environment variables and should be excluded from version control through `.gitignore`.

For a production deployment, the API key should be moved to a backend proxy or another server side architecture.

This is particularly important because variables prefixed with `EXPO_PUBLIC_` are exposed to the client application and can be extracted from the compiled application.

The current client side configuration is therefore appropriate for an academic demonstration, but should not be considered a secure production architecture for protecting API credentials.

## Accessibility

The application is designed with the following accessibility considerations:

* WCAG AA contrast requirements for text elements
* Minimum touch target of 44 x 44 points
* `accessibilityLabel` on interactive controls
* `accessibilityHint` where additional context is required
* Support for Dynamic Type font scaling
* Haptic feedback through `expo-haptics` on primary actions
* Clear visual hierarchy for input and generated results

## Limitations

The application currently has the following limitations:

* Internet connectivity is required for communication with the Gemini API.
* Model responses may vary between requests containing the same input.
* The application depends on the availability of the configured AI provider.
* Client side API key exposure is not appropriate for a production environment.
* AI generated interpretations are probabilistic and should not be treated as objective assessments of another person's intentions.
* The application should not be used as a substitute for professional mental health or medical guidance.
* Sensitive personal information should not be entered into the application.

## Future Work

Potential future improvements include:

* Backend proxy for API key isolation
* Offline caching of previous interpretations
* Multi language support
* Unit tests for `generator.ts`
* Automated testing for UI components
* CI pipeline for linting and type checking
* Improved error handling and retry logic
* More robust structured output validation
* User configurable interpretation preferences
* Improved persistence and history management

## Project Objective

ReframeIA is an academic mobile development project focused on combining React Native application development with generative AI.

The project explores how structured AI generated interpretations can provide an additional perspective when a textual message has multiple possible meanings.

The application does not attempt to determine the objective intention of the sender. Instead, it provides alternative interpretations to encourage a more deliberate response.

## License

MIT

## Author

Rogerio Bianchini

Academic project developed for mobile development coursework, 2026.
