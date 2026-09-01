import "dotenv/config";

export default {
  expo: {
    name: "Back2Campus",
    slug: "Back2Campus",
    icon: "./assets/icon.png", // <-- add this line
    android: {
      package: "com.abhitrambadiya.Back2Campus"
    },
    ios: {
      bundleIdentifier: "com.abhitrambadiya.Back2Campus"
    },
    extra: {
      API_BASE_URL: process.env.API_BASE_URL || "https://back2campus-server.onrender.com/api",
      eas: {
        projectId: "7121c595-bac9-49ca-8834-00bcb2c8f9c3"
      }
    }
  },
};
