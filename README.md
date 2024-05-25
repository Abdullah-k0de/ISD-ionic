If the project isn't edited:
1. Run the "android" folder in Android Studio emulator. 
2. Run the "ios" folder in xcode simulator. 


If the project is edited. Follow these steps:
To run the code, please follow the steps after downloading the zip file (Node.js must be downloaded):
  1. Extract the zip file and open the folder in visual studio code.
  2. Change the directory to the folder inside from the terminal.
  3. Run the command: "npm install --save-dev @angular-devkit/build-angular --force".
- Now, you can run the code on the browser, using the command: "ionic serve".
- If the ionic is not recognized, please download the ionic package using npm install -g ionic & ionic/cli

To test on an emulator or simulator:
  1. Run "ionic cap sync" to sync the project on the ios, android, and web platforms. (To sync on specific platform, use: "ionic cap sync android").
  2. Open the emulator or simulator using the command: "ionic cap open android". This will open the project in Android Studio, and an apk or virtual device can be build.
  3. Similarly open the simulator using the command: "ionic cap open ios". This will open xcode in Mac and the project can be tested on virtual device or an apple phone.
- The visual studio has to be allowed to open other devices.
- The environment variables have to defined for the "android" to recognize the Android Studio and "ios" to recognize the xcode file locations.
