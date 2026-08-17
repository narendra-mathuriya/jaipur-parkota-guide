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

## Release signing

Create a keystore outside the repository, then configure Android Studio's release signing settings or create a local, ignored Gradle signing config. Do not commit keystore files or signing passwords.

Suggested release flow:

1. `npm run test`
2. `npm run android:sync`
3. Open Android Studio with `npm run android:open`
4. Build a signed AAB from Android Studio's `Build > Generate Signed Bundle / APK` menu.

The app includes custom launcher/splash assets, dark system bars, and Android back-button handling through Capacitor.
