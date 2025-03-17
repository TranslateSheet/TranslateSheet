import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import * as Localization from "expo-localization";
import { I18nManager } from "react-native";
import i18n from "i18next";

const LanguageToggle = () => {
  const systemLocales = Localization.getLocales();
  const normalizeLanguageTag = (tag: string) => tag.split("-")[0]; // Extract primary tag
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language ?? "en"
  );

  const handleLanguageChange = (languageTag: string) => {
    setSelectedLanguage(languageTag); // Use normalized tag for state

    i18n.changeLanguage(languageTag).then(() => {
      const isRTL =
        Localization.getLocales().find(
          (locale) => normalizeLanguageTag(locale.languageTag) === languageTag
        )?.textDirection === "rtl";

      I18nManager.allowRTL(!!isRTL);
      console.log(`[LanguageToggle] Language changed to: ${languageTag}`);
    });
  };

  const locales =
    Platform.OS === "web"
      ? [
          { languageCode: "en", languageTag: "en", regionCode: "US" },
          { languageCode: "es", languageTag: "es", regionCode: "CO" },
          { languageCode: "ja", languageTag: "ja", regionCode: "JP" },
          { languageCode: "zh", languageTag: "zh", regionCode: "CN" },
          { languageCode: "ru", languageTag: "ru", regionCode: "RU" },
          { languageCode: "de", languageTag: "de", regionCode: "DE" },
        ]
      : systemLocales;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      {locales.map((locale) => (
        <TouchableOpacity
          key={locale.languageTag}
          style={styles.radioContainer}
          onPress={() => handleLanguageChange(locale.languageTag)}
        >
          <View
            style={[
              styles.radioButton,
              selectedLanguage === locale.languageTag && styles.radioSelected,
            ]}
          />
          <Text style={styles.label}>
            {locale.languageCode} ({locale.regionCode})
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioButton: {
    height: 16,
    width: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#333",
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: "#333",
  },
  label: {
    fontSize: 14,
  },
});

export default LanguageToggle;
