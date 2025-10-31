# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FunFacts** is a React Native mobile app built with Expo that presents users with trivia facts and asks them to guess if each fact is true or false. The app tracks scores, displays game history, and integrates Google Mobile Ads.

- **Framework**: Expo (~54.0) with React Native 0.81.5
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing) with tab navigation
- **Architecture**: Context-based state management for game state
- **New Architecture**: Enabled (newArchEnabled: true)
- **React Compiler**: Enabled (experimental)

## Development Commands

### Start Development
```bash
npm start                    # Start Expo development server
npm run android             # Run on Android emulator/device
npm run ios                 # Run on iOS simulator/device
npm run web                 # Run web version
```

### Code Quality
```bash
npm run lint                # Run ESLint on the codebase
```

### Build Native Apps
```bash
# Android
expo run:android            # Build and run Android app

# iOS
expo run:ios                # Build and run iOS app
```

## Project Architecture

### File-Based Routing (Expo Router)
- **app/_layout.tsx**: Root layout with theming, SafeAreaProvider, and ad initialization
- **app/(tabs)/_layout.tsx**: Tab navigation layout with GameProvider context wrapper
- **app/(tabs)/index.tsx**: Main game screen (Facts tab)
- **app/(tabs)/scores.tsx**: Score history and statistics (Scores tab)
- **app/modal.tsx**: Modal screen

### State Management
- **contexts/game-context.tsx**: Provides global game state via React Context
  - `currentScore`: Current game progress (correct/total)
  - `hasShownHighScoreNotification`: Prevents duplicate high score alerts
  - Use `useGameContext()` hook to access context within the GameProvider tree

### Service Layer
Core business logic is centralized in the `services/` directory:

- **facts-api.ts**: Main facts service
  - Fetches true facts from uselessfacts.jsph.pl API on-demand
  - Fetches false facts from local `false-facts-api.ts`
  - Converts between `ApiFact`, `GameFact`, and `EnhancedFact` types
  - `getRandomGameFact()`: Randomly chooses between API true fact (50%) or local false fact (50%)
  - Retry logic with exponential backoff (3 attempts with 500ms delay on first load)
  - Graceful fallback: if API fails, uses local false fact instead
  - No batching or caching - fetches one fact at a time as needed

- **score-manager.ts**: Score persistence and statistics
  - Uses AsyncStorage for local persistence
  - Implements composite scoring: `correctAnswers + (percentage * totalQuestions / 100)`
  - Tracks current in-progress score and finalized score history
  - `finalizeScore()`: Saves completed game and checks for new high score
  - `getScoreStats()`: Returns current score, personal best, and all historical scores

- **false-facts-api.ts**: Local collection of curated false facts
  - 15 convincing false facts across multiple categories
  - Used for game variety and as fallback when API fails
  - Each fact includes explanation of why it's false

- **ads.ts**: Google Mobile Ads initialization and configuration
  - Test ads in development, production ad units for Android
  - iOS ad units not yet configured (uses test ads)
  - `adUnitIds`: Platform-specific ad unit IDs
  - `adFeatures`: Feature flags for banner, interstitial, and native ads
  - `initializeMobileAds()`: Initialize ads with EU consent handling

- **ads-consent.ts**: GDPR/consent management for ads

### Components
- **components/game-fact-card.tsx**: Displays fact with True/False buttons, shows answer feedback
- **components/fact-detail-modal.tsx**: Modal showing fact source and details
- **components/ads/**: Ad components
  - `banner-ad.tsx`: Bottom-anchored banner ads
  - `interstitial-ad.tsx`: Full-screen interstitial ads (shown every 12 facts)
  - `native-ad.tsx`: Native ad component
  - `native-score-row.tsx`: Native ad integrated into score history list
- **components/themed-text.tsx** & **themed-view.tsx**: Theme-aware wrappers
- **components/ui/icon-symbol.tsx**: Icon component with platform-specific implementations

### Key Gameplay Flow
1. User launches app → `initializeMobileAds()` called in root layout
2. Main game screen loads → `loadInitialGameState()` resets current score and loads first fact
3. `factsApi.getRandomGameFact()` → Randomly fetches true fact from API (50%) or false fact from local (50%)
4. User answers → `handleAnswer()` updates score, saves to context, checks for high score notification
5. User clicks "New Challenge" → `loadNewGameFact()` fetches next single fact on-demand
6. Interstitial ad shown every 4 fact answers
7. User clicks "Restart" → `performRestart()` finalizes score (if correct answers), resets game

### Styling Approach
- Uses React Native StyleSheet with Airbnb-inspired design
- LinearGradient for visual polish (headers, buttons, score borders)
- Platform-specific fonts: 'System' (iOS) / 'Roboto' (Android)
- Haptic feedback on all interactions (Expo Haptics)
- Dynamic color gradients for score display (green for correct, red for incorrect)

### Path Aliases
The `@/` path alias maps to the root directory:
```typescript
import { useGameContext } from '@/contexts/game-context';
import { factsApi } from '@/services/facts-api';
```

## API Integration Notes

### Facts APIs
- **Primary**: uselessfacts.jsph.pl - random true facts (external API)
  - Endpoint: `GET /api/v2/facts/random`
  - Returns single random fact
  - No bulk endpoint available
- **Secondary**: Local false facts from `false-facts-api.ts` (15 curated myths)
- **Strategy**: 50/50 random selection - each fact request has 50% chance of API call (true) or local (false)
- **On-demand loading**: No caching or batching, fetches one fact per user request

### Ad Integration
- Uses `react-native-google-mobile-ads` SDK
- Test ads in `__DEV__` mode
- Production Android ad units configured in `services/ads.ts`
- iOS ad units currently using test IDs
- Banner ads anchored to bottom of screens
- Interstitial ads triggered after every 4 fact answers
- Native ads displayed in score history list

## Data Persistence

Uses `@react-native-async-storage/async-storage` for local storage:
- **`@FunFacts:currentScore`**: In-progress game score (cleared on finalize or restart)
- **`@FunFacts:gameScores`**: Array of finalized game scores, sorted by composite score

## Native Features

### Android
- Package: `com.petyoplpetrov.FunFacts`
- Adaptive icon with background/foreground images
- Edge-to-edge display enabled
- ProGuard rules for Google Ads SDK

### iOS
- Bundle ID: `com.petyoplpetrov.FunFacts`
- Supports tablet
- Test Google Ads App ID (production ID not configured)

## Important Development Notes

- **Strict TypeScript**: All code uses strict mode
- **Type Safety**: Use proper types (`GameFact`, `GameScore`, `EnhancedFact`, etc.)
- **Error Handling**: All API calls and async operations have try-catch blocks
- **Dev Logging**: Console logs are wrapped in `if (__DEV__)` checks
- **Haptic Feedback**: Use `expo-haptics` for all button presses and interactions
- **Ad Testing**: Use TestIds from `react-native-google-mobile-ads` in development

## Common Tasks

### Adding a New Feature to the Game
1. Update game state in `contexts/game-context.tsx` if global state needed
2. Implement business logic in appropriate service file
3. Update UI in `app/(tabs)/index.tsx` or create new component
4. Use existing patterns: haptic feedback, loading states, error handling

### Modifying Score Calculation
- Edit `score-manager.ts` → `calculateCompositeScore()` method
- Current formula: `correctAnswers + (percentage * totalQuestions / 100)`
- Update backward compatibility in `getAllScores()` if formula changes

### Configuring Production Ads
- Update `services/ads.ts` → `adUnitIds` object
- Replace test IDs with real AdMob unit IDs
- Test with `adFeatures` flags to enable/disable ad types

### Adding a New API Source for Facts
- Create new service in `services/` directory
- Update `getRandomGameFact()` method in `facts-api.ts` to include new source
- Adjust probability distribution if needed (currently 50% API / 50% local)
- Return `GameFact` type with `isTrue` boolean and optional `explanation`
- Add retry logic if the new API is unreliable
