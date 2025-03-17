# Welcome to your Expo app 👋 with TranslateSheet✨

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) and [`translate-sheet`](https://www.translatesheet.co/).

https://github.com/user-attachments/assets/81db5fad-01f3-400f-8cd4-df44107a69af

## Get started

1. Install dependencies

   ```bash
   bun install
   ```

2. Start the app

   ```bash
    bunx expo start
   ```

## Generating new languages with TranslateSheet

To generate a new language, you must have a valid API key in your `translateSheetConfig.js` file
If you do not have a valid api key, you can get one here: https://app.translatesheet.co/

Once your key is configured, add as many languages as you want to the `languages` array in your `translateSheetConfig.js` file

Lastly, run the command `bun translate-sheet generate` 
