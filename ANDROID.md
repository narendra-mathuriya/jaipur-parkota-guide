# Android app

This project uses Capacitor to package the static Next.js export as an Android app.

## Commands

- `npm run android:sync` builds the site and syncs `out/` into the Android project.
- `npm run android:open` opens the native project in Android Studio.
- `npm run android:build` builds a debug APK with Gradle.

## Requirements

Install Android Studio and the Android SDK, then make sure either `ANDROID_HOME` is set or `android/local.properties` contains:

```properties
sdk.dir=/path/to/Android/Sdk
```

`android/local.properties` is intentionally ignored by Git because it is machine-specific.
