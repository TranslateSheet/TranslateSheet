import React from "react";
import { Trans } from "react-i18next";
import { Link } from "expo-router";
import TranslateSheet from "translate-sheet";

// TODO: BA - Trans component needs further testing w TranslateSheet

const GiveConsentText = () => {
  return (
    <Trans
      defaults={translations.giveConsent}
      components={{
        privacyLink: (
          <Link
            href="https://knowapp.com/privacy"
            target="_blank"
            style={{ textDecorationLine: "underline" }}
          />
        ),
        termsLink: (
          <Link
            href="https://knowapp.com/terms"
            target="_blank"
            style={{ textDecorationLine: "underline" }}
          />
        ),
      }}
    />
  );
};

const translations = TranslateSheet.create("GiveConsentText", {
  body: "If you need to change content,\nyour event details will be saved.",
  giveConsent:
    "By pressing “Continue” you agree to our <privacyLink>Privacy Policy</privacyLink> & <termsLink>Terms</termsLink> and consent to receive text messages from us. Message and data rates apply. Text STOP at anytime to cancel.",
});

export default GiveConsentText;
