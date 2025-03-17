### What is TranslateSheet? 
Built on top of the trusted i18next library, TranslateSheet combines developer-first workflows with powerful features, making localization easy for both new and existing apps

- **Inline Translation Definitions**
Define your app's translations directly in your components with a simple API. No more juggling massive external files during development – keep your translations organized and scoped by component or feature.

- **Hot reloading support**
One major issue with i18next is that it takes away the ability to quickly make a text change or add a new piece of text without completely restarting your app. TranslateSheet serves as a proxy on top of i18next, and for the first time gives you the optimal desired DX with the combination of both localization and hot-reloading support.

- **Full TypeScript Support**
Another pain point that comes with using i18next is type safety. The ignite boilerplate has done a great job filling the gaps by providing its own in-house type safety on all of its custom components with props such as `tx` and `txOptions`. With TranslateSheet, type safety comes baked in. There is no need for separate props on the components to define a translated string and the translated string options. 

- **AI Translation**
For teams that want to serve their apps to users in other countries as fast as possible, quickly translate your app in over 200+ languages with a single command `translate-sheet generate`.

- **Translation CRM**
For teams that already have translation files (i.e. ignite boilerplate) and want to adopt the TranslateSheet CRM, push up all of your translation files with a single command `translate-sheet push`. Within seconds, your app's translations are accessible in a user-friendly interface making it incredibly easy to manage your app's text and hire professional translators to validate your text strings or add additional languages. You can provide context to your text strings via image or recording. Once approved, auto-open a PR (or merge to main) with your latest changes or manually pull them locally with the command `translate-sheet pull`


<img width="1728" alt="Screenshot 2025-02-25 at 1 00 20 PM" src="https://github.com/user-attachments/assets/b2f5a698-1e10-424c-b217-4d8512c52ddf" />

[Ignite demo w/ TranslateSheet](https://x.com/bran_aust/status/1893713154418327608)

For more detailed information on installation and usage, please refer to the docs here:

[TranslateSheet Documentation](https://docs.translatesheet.co/)
