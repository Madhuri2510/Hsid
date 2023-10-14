let name;
console.log(`Profile: ${process.env.profile}`);
if (process.env.profile !== undefined) {
  //name = process.env.profile.split(':')[0];
  let name_from_config = process.env.profile.split(':');
  name_from_config.pop();
  name = name_from_config.join(':');
}

exports.deviceConfig = {
  Android_TV_Sim: {
    type: 'android.emulator',
    testBinaryPath:
      '../ten-foot/android/sling/build/outputs/apk/androidTest/prodSling/debug/sling-prod-sling-debug-androidTest.apk',
    binaryPath:
      '../ten-foot/android/sling/build/outputs/apk/prodSling/debug/sling-prod-sling-x86-debug.apk',
    build:
      'cd .. && cd ten-foot && react-native bundle --platform android  --entry-file index.js --bundle-output android/sling/src/main/assets/index.android.bundle --assets-dest android/sling/src/main/res && cd android && ./gradlew sling:assembleDebug sling:assembleAndroidTest -DtestBuildType=debug && cd .. && cd ..  && cd testing',
    device: {
      avdName: name !== undefined ? name : 'Android_TV_720p_API_29',
    },
    name: name !== undefined ? name : 'Android_TV_720p_API_29',
  },
  Android_TV_Device: {
    type: 'android.attached',
    testBinaryPath:
      '../ten-foot/android/sling/build/outputs/apk/androidTest/prodSling/debug/sling-prod-sling-debug-androidTest.apk',
    binaryPath:
      '../ten-foot/android/sling/build/outputs/apk/prodSling/debug/sling-prod-sling-armeabi-v7a-debug.apk',
    build:
      'cd .. && cd ten-foot && react-native bundle --platform android  --entry-file index.js --bundle-output android/sling/src/main/assets/index.android.bundle --assets-dest android/sling/src/main/res && cd android && ./gradlew sling:assembleDebug sling:assembleAndroidTest -DtestBuildType=debug && cd .. && cd ..  && cd testing',
    device: {
      adbName: name !== undefined ? name : 'G070VM1704030M50',
    },
  },
  Android_TV_Device_testapk: {
    type: 'android.attached',
    testBinaryPath:
      '../ten-foot/android/sling/build/outputs/apk/androidTest/prodSling/debug/sling-prod-sling-debug-androidTest.apk',
    binaryPath:
      '../ten-foot/android/sling/build/outputs/apk/prodSling/debug/sling-prod-sling-armeabi-v7a-debug.apk',
    build:
      'cd .. && cd ten-foot && react-native bundle --platform android  --entry-file index.js --bundle-output android/sling/src/main/assets/index.android.bundle --assets-dest android/sling/src/main/res && cd android && ./gradlew sling:assembleAndroidTest -DtestBuildType=debug && cd .. && cd ..  && cd testing',
    device: {
      adbName: name !== undefined ? name : 'G070VM1704030M50',
    },
  },

  Android_TV_Sim_Ios: {
    type: 'android.emulator',
    testBinaryPath:
      '../ten-foot/android/sling/build/outputs/apk/androidTest/prodSling/debug/sling-prod-sling-debug-androidTest.apk',
    binaryPath:
      '../ten-foot/android/sling/build/outputs/apk/prodSling/debug/sling-prod-sling-x86-debug.apk',
    build:
      'cd .. && cd ten-foot && react-native bundle --platform android  --entry-file index.js --bundle-output android/sling/src/main/assets/index.android.bundle --assets-dest android/sling/src/main/res && cd android && ./gradlew sling:assembleDebug sling:assembleAndroidTest -DtestBuildType=debug && cd .. && cd ..  && cd testing',
    device: {
      avdName: name !== undefined ? name : 'Android_TV_720p_API_29',
    },
    name: name !== undefined ? name : 'Android_TV_720p_API_29',
  },
  Android_TV_Cicd: {
    type: 'android.attached',
    testBinaryPath:
      '../ten-foot/android/sling/build/outputs/apk/androidTest/prodSling/debug/sling-prod-sling-debug-androidTest.apk',
    binaryPath:
      '../ten-foot/android/sling/build/outputs/apk/prodSling/debug/sling-prod-sling-armeabi-v7a-debug.apk',
    build:
      'cd .. && cd ten-foot && react-native bundle --platform android  --entry-file index.js --bundle-output android/sling/src/main/assets/index.android.bundle --assets-dest android/sling/src/main/res && cd android && ./gradlew sling:assembleDebug sling:assembleAndroidTest -DtestBuildType=debug && cd .. && cd ..  && cd testing',
    device: {
      adbName: name !== undefined ? name : 'G070VM1704030M50',
    },
  },
  Android_FireTV_Cicd: {
    type: 'android.attached',
    testBinaryPath:
      '../ten-foot/android/sling/build/outputs/apk/androidTest/prodAmazon/debug/sling-prod-amazon-debug-androidTest.apk',
    binaryPath:
      '../ten-foot/android/sling/build/outputs/apk/prodAmazon/debug/sling-prod-amazon-armeabi-v7a-debug.apk',
    build:
      'cd .. && cd ten-foot && react-native bundle --platform android  --entry-file index.js --bundle-output android/sling/src/main/assets/index.android.bundle --assets-dest android/sling/src/main/res && cd android && ./gradlew sling:assembleDebug sling:assembleAndroidTest -DtestBuildType=debug && cd .. && cd ..  && cd testing',
    device: {
      adbName: name !== undefined ? name : 'G070VM1704030M50',
    },
  },
  Android_Mobile: {
    type: 'android.emulator',
    testBinaryPath:
      '../mobile/android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
    binaryPath:
      '../mobile/android/app/build/outputs/apk/debug/app-x86-debug.apk',
    build:
      'cd .. && cd ten-foot && react-native bundle --platform android  --entry-file index.js --bundle-output android/sling/src/main/assets/index.android.bundle --assets-dest android/sling/src/main/res && cd android && ./gradlew sling:assembleDebug sling:assembleAndroidTest -DtestBuildType=debug && cd .. && cd ..  && cd testing',
    device: {
      avdName: name !== undefined ? name : 'Pixel_3_API_29',
    },
    name: name !== undefined ? name : 'Pixel_3_API_29',
  },
  ios_sim: {
    type: 'ios.simulator',
    binaryPath:
      '/Users/sudheerreddy/Library/Developer/Xcode/DerivedData/Mobile-dwzmvltkozmxbmggwwqrkmixujxe/Build/Products/Debug-iphonesimulator/Mobile.app',
    build:
      'cd .. && cd ten-foot && react-native bundle --platform android  --entry-file index.js --bundle-output android/sling/src/main/assets/index.android.bundle --assets-dest android/sling/src/main/res && cd android && ./gradlew sling:assembleDebug sling:assembleAndroidTest -DtestBuildType=debug && cd .. && cd ..  && cd testing',
    device: {
      type: 'iPhone 11 Pro Max',
    },
  },
};
