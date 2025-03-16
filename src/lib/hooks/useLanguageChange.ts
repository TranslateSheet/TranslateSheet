import { useState, useEffect } from "react";
import languageChangeEmitter from "../utils/languageChangeEmitter";

// Hook to force re-render on language change
export const useLanguageChange = () => {
  const [, setLangChange] = useState(0);

  useEffect(() => {
    return languageChangeEmitter.subscribe(() => {
      console.log("Language change detected");
      setLangChange((prev) => (prev + 1) % 3);
    });
  }, []);
};

export default useLanguageChange;
