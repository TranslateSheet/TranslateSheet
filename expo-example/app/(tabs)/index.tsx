import React from "react";
import { Image, StyleSheet, Platform } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import LocationToggle from "@/components/LocationToggle";
import TranslateSheet from "@/i18n/translate-sheet";
import TestInput from "@/components/TestInput";

export default function HomeScreen() {
  translations.$useLanguageChange();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">
          {translations.headerTitle({ name: "Expo" })}
        </ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{translations.step1.title}</ThemedText>
        <ThemedText>
          {translations.step1.editText}{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          {translations.step1.pressChanges}{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          {translations.step1.devTools}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{translations.step2.title}</ThemedText>
        <ThemedText>{translations.step2.description}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{translations.step3.title}</ThemedText>
        <ThemedText>
          {translations.step3.runCommand}{" "}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{" "}
          {translations.step3.freshApp}
          <ThemedText type="defaultSemiBold">
            {translations.step3.appText}
          </ThemedText>{" "}
          {translations.step3.moveDir}{" "}
          <ThemedText type="defaultSemiBold">
            {translations.step3.appText}
          </ThemedText>{" "}
          {translations.step3.to}{" "}
          <ThemedText type="defaultSemiBold">
            {translations.step3.appExample}
          </ThemedText>
          .
        </ThemedText>
      </ThemedView>
      <LocationToggle />
      <TestInput />
    </ParallaxScrollView>
  );
}

const translations = TranslateSheet.create("HomeScreen", {
  headerTitle: "Welcome! {{name}}",
  step1: {
    title: "Step 1: Try it",
    editText: "Edit",
    pressChanges: "to see changes. Press",
    devTools: "to open developer tools.",
  },
  step2: {
    title: "Step 2: Explore",
    description:
      "Tap the Explore tab to learn more about what's included in this starter app.",
  },
  step3: {
    title: "Step 3: Get a fresh start",
    runCommand: "When you're ready, run",
    freshApp: "to get a fresh ",
    appText: "app",
    to: "to",
    moveDir: "directory. This will move the current",
    appExample: "app-example",
  },
  languageSelect: "Select Language",
});

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  languageToggleContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  languagePicker: {
    height: 50,
    width: "100%",
  },
});
