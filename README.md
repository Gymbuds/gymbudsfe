# GymBuds FE
Frontend for GymBuds, built with React Native using Expo Dev Client. This mobile app is tailored specifically for iOS, and handles the entire mobile user interface, including:
- User authentication and profile management
- Workout logging and health data tracking using Apple HealthKit
- Map to explore and join nearby gym communities using Google Places API
- Communities post creation and interaction features
- Partner matching based on user preferences and availability
- In-app chat with matched partners

# Technologies Used + Packages Used
## Technology
- React Native: Mobile App Framework
- Expo Dev Client: Native development environment for React Native
- Apple HealthKit API: Health data integration (iOS only)
- Google Places API: Fetch nearby gyms and their information
- twrnc: Tailwind CSS for React Native
## Packages
Core Frameworks & Navigation:
- expo
- react-native
- expo-router
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/bottom-tabs

UI & Styling:
- twrnc
- react-native-safe-area-context
- react-native-vector-icons
- expo-linear-gradient
- react-native-elements

Forms & Inputs:
- @react-native-picker/picker
- @miblanchard/react-native-slider
- react-native-dropdown-picker
- react-native-modal-selector

Utilities & Async:
- @react-native-async-storage/async-storage
- axios
- date-fns

Health & Device Features:
- react-native-health
- expo-location
- expo-image-picker

Maps & Media:
- react-native-maps
- react-native-svg
- react-native-webview

# Frontend Dependencies
- Node.js and npm
- Expo CLI
- Xcode (required for iOS build and HealthKit integration)
- Homebrew (for installing CocoaPods on macOS)
- CocoaPods (for native module linking)
- Physical iPhone (to run app)

# Steps to Install and Run
## Install Node.js and npm:
https://nodejs.org/
### Open up a zsh or terminal
#### Verify the installation:
- node -v
- npm -v

## Install Expo CLI: 
- npm install --global expo
#### Verify the installation:
- npx expo --version

## Migrate to Expo Dev Client:
- expo install expo-dev-client
- expo prebuild
- npm install

## iOS Setup (HealthKit Support)
#### Install CocoaPods:
- brew install cocoapods
- cd ios && pod install && cd ..
#### Xcode Configuration:
- Open the 'ios' folder with Xcode
- Go to gymbudfrontend → Signing & Capabilities
- Enable HealthKit
- Ensure Bundle Identifier is unique
- Add your Development Team
- Ensure Developer Mode on physical iPhone enabled

## Run Project
#### To start the dev server and clear cache:
- npx expo start --clear
- Use Xcode to build and run on a physical iPhone.
