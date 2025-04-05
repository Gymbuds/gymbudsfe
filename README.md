# gymbudsfe
Front end for GymBuds

Install Node.js and npm.
Verify the installation by using:

node -v

npm -v

Install Expo CLI through: 

npm install --global expo

Verify the installation:

npx expo --version

Migrating to Expo Dev Client:
- Ensure Developer Mode on physical iPhone enabled

1. Install Expo Dev Client- expo install expo-dev-client
2. Eject- expo prebuild
3. Install Dependancies- npm install 
4. Install CocoaPods- (mac) brew install cocoapods
5. Intialize CocaPods depdencies- cd ios && pod install && cd ..
6. Enable HealthKit in Xcode-   Click on gymbudfrontend -> Signing & Capabilities → HealthKit (Enable Development Team in 'Signing')
- Ensure that bundler identifier is unique !!! 
7. npx expo start --clear, make build on XCode with your physical device. 
