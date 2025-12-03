# IITD Mobile App - React Native

React Native mobile application for iOS and Android platforms.

## Prerequisites

- Node.js >= 18
- npm or yarn
- React Native CLI
- Xcode (for iOS development on macOS)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Install iOS dependencies (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API base URL
   ```

## Running the App

### iOS
```bash
npm run ios
# or
yarn ios
```

### Android
```bash
npm run android
# or
yarn android
```

### Start Metro Bundler
```bash
npm start
# or
yarn start
```

## Project Structure

```
mobile/
├── src/
│   ├── App.tsx                 # Root component
│   ├── models/                 # TypeScript models
│   ├── services/               # API services
│   ├── screens/                # Screen components
│   ├── components/             # Reusable components
│   ├── utils/                  # Utility functions
│   ├── context/                # Context providers
│   └── navigation/            # Navigation setup
├── android/                    # Android native code
├── ios/                        # iOS native code
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3000
# For physical devices, use your computer's IP:
# API_BASE_URL=http://192.168.1.100:3000
```

## Development

- **Type checking:** `npm run type-check`
- **Linting:** `npm run lint`
- **Testing:** `npm test`

## Building for Production

### iOS
```bash
cd ios
xcodebuild -workspace IITDMobile.xcworkspace -scheme IITDMobile -configuration Release
```

### Android
```bash
cd android
./gradlew assembleRelease
```

## API Integration

The app connects to the NestJS backend API. See `REACT_NATIVE_INTEGRATION.md` for detailed integration guide.

## Troubleshooting

### Metro Bundler issues
```bash
npm start -- --reset-cache
```

### iOS build issues
```bash
cd ios && pod deintegrate && pod install && cd ..
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
```

