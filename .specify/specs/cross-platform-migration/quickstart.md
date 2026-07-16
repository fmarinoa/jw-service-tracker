# Quickstart: Cross-Platform Migration to Universal Expo

This guide details how to run, validate, and test the unified client on Web, iOS, and Android.

## Setup Requirements

1. Make sure Node.js (v24+) is installed.
2. Install pnpm globally if not already present:
   ```bash
   npm install -g pnpm
   ```
3. Make sure MongoDB is running locally or configured in `apps/api/.env`.

## Starting the Project

1. Run dependencies installation from the project root:
   ```bash
   pnpm install
   ```
2. Start the NestJS API:
   ```bash
   pnpm --filter @jw-tracker/api dev
   ```
3. Start the Expo application:
   ```bash
   pnpm --filter @jw-tracker/client start
   ```

## Validating on Different Targets

### Web Target
1. After starting Expo, press **w** in the console.
2. The app will open in your default browser at `http://localhost:8081`.
3. Try logging in, viewing the dashboard, and logging out.

### iOS Simulator
1. Ensure Xcode and simulator are installed.
2. In the Expo console, press **i**.
3. The simulator will boot and launch the Expo Go container app to render the interface.

### Android Emulator
1. Ensure Android Studio and an AVD (Android Virtual Device) are running.
2. In the Expo console, press **a**.
3. The emulator will launch and run the app.
