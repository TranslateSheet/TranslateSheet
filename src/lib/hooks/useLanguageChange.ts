"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import languageChangeEmitter from "../utils/languageChangeEmitter";

// Hook to force re-render on language change
export const useLanguageChange = () => {
  const [, set] = useState(false);

  // debounce the language change
  const debouncedRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedLanguageChange = useCallback(() => {
    console.log("Language change detected");
    set((prev) => !prev);
  }, []);

  useEffect(() => {
    return languageChangeEmitter.subscribe(() => {
      if (debouncedRef.current) {
        clearTimeout(debouncedRef.current);
      }
      debouncedRef.current = setTimeout(() => {
        debouncedLanguageChange();
      }, 200);
    });
  }, []);
};
