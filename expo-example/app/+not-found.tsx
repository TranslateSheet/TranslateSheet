import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import TranslateSheet from "@/i18n/translate-sheet";
import { link } from "fs";
import { Fragment } from "react";

export default function NotFoundScreen() {
  return (
    <Fragment>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{translations.title}</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">{translations.link}</ThemedText>
        </Link>
      </ThemedView>
    </Fragment>
  );
}

const translations = TranslateSheet.create("common", {
  title: "This screen doesn't exist.",
  link: "Go to home screen!",
  hello2: "this is a test brah",
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
