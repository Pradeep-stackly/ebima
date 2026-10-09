# Enterprise Business Insights - Mobile App

Task 1 - Project setup and dashboard UI using React Native, Expo and TypeScript.

## How to run

```
npm install
npm run dev
```

Scan the QR code with the Expo Go app, or press `w` to open in browser.

## Folder structure

```
src/
  components/   reusable UI components (KpiCard, ActivityList, TrendChart etc.)
  screens/      Dashboard, Analytics, Alerts, Profile
  navigation/   bottom tab navigation
  services/     mock data and dashboard service
  hooks/        useDashboardData hook
  types/        TypeScript types
  constants/    colors, spacing, font sizes
  utils/        formatting functions
  assets/       images
```

## Data

Right now the app uses mock data from `src/services/mockData.ts`.

Later, when the FastAPI backend is ready, set `USE_MOCK_DATA = false` in `src/services/dashboardService.ts` and the app will call the API instead. No changes needed in the screens or components.
