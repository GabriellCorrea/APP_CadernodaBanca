import 'dotenv/config';

export default {
  expo: {
    name: "meuApp",
    slug: "meuApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/CADERNO-Photoroom.png",
    scheme: "meuapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera",
        NSMicrophoneUsageDescription: "Allow $(PRODUCT_NAME) to access your microphone"
      }
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "CAMERA",
        "RECORD_AUDIO"
      ]
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
          microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
          recordAudioAndroid: true
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      API_URL: process.env.API_URL
    }
  }
};

