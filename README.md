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

Install dependencies using:

npm install

Start projects by running:

cd GymBuds

npx expo start --clear

To run the app on a physical device like your phone, first install Expo Go on your phone, then create an account for Expo and login to the app. In Expo Go, you will get the option to scan a QR code and that QR code will be showing in your terminal after you run "npm expo start --clear".

Then you will be able to test your code in React Native instantenously with the Expo Go app as you save your changes to files in the coding environment.

If you do not want to run the app on your physical device, you are also able to run on a emulator.


Migrating to Expo Dev Client:
1. Install Expo Dev Client- expo install expo-dev-client
2. Eject- expo prebuild
3. Install HealthKit Library- npm install react-native-health 
4. Install CocoaPods- cd ios && pod install && cd ..
5. Enable HealthKit in Xcode- Signing & Capabilities → HealthKit (Enable Development Team in 'Signing')
6. Add Permissions in Info.plist- NSHealthUpdateUsageDescription: Allow GymBuds to track your health data & NSHealthShareUsageDescription: Allow GymBuds to access your health data.
7. npx expo start --clear, make build on XCode with your physical device. 