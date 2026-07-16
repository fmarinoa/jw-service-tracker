# Research: Cross-Platform Migration to Universal Expo

## Decision 1: Expo 52 as the Client Engine

We choose Expo 52 for Web, iOS, and Android. Expo 52 provides first-class support for metro web compiling, Expo Router v3, and React 19 / React Native 0.76.

- **Rationale**: Building a single React Native application that renders to the browser via `react-native-web` ensures 100% logic and component sharing.
- **Alternatives considered**: Next.js + React Native CLI. Ejecting or keeping a separate Next.js web client requires double the work for updates, dual dependency management, and high likelihood of visual/functional drift.

## Decision 2: NativeWind (Tailwind CSS)

NativeWind compiles Tailwind classes into React Native Stylesheets on Android/iOS and standard CSS class names on the Web.

- **Rationale**: The legacy Next.js codebase utilizes Tailwind CSS. NativeWind allows us to copy Tailwind classes like `className="flex flex-row items-center justify-between p-4 bg-white border-b border-gray-200"` directly, reducing styling rewrite time by 90%.
- **Alternatives considered**: Standard `StyleSheet.create`. This would require manual conversion of every single Tailwind class to style objects, which is error-prone and time-consuming.

## Decision 3: Enrutamiento based on Expo Router

Expo Router brings file-based routing to React Native, working on iOS, Android, and Web with native navigation under the hood.

- **Rationale**: Next.js uses file-based routing in the `app/` directory. Transitioning to Expo Router means we can map the routes 1:1, making the project structure instantly recognizable to developers coming from Next.js.
- **Alternatives considered**: `react-navigation`. This requires manually configuring stack, tab, and drawer navigators in a central file, making URL management on the Web complex.
