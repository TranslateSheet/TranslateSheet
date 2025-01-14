import { useState, useEffect } from "react";
import languageChangeEmitter from "../languageChangeEmitter";

// Hook to force re-render on language change
const useLanguageChange = () => {
  const [, setLangChange] = useState(0);

  useEffect(() => {
    return languageChangeEmitter.subscribe(() => {
      setLangChange((prev) => prev + 1);
    });
  }, []);
};

export default useLanguageChange
