import { describe, it, expect, beforeAll, afterEach, afterAll } from "bun:test";
import fs from "fs";
import path from "path";
import { generateTranslationTypesFile } from "../src/helpers/generateTranslationTypesFile";

const TEST_OUTPUT_DIR = path.join(process.cwd(), "test-output-types");

function cleanupTestOutput() {
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
}

describe("generateTranslationsTypesFile", () => {
  beforeAll(() => {
    cleanupTestOutput();
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(() => {
    cleanupTestOutput();
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterAll(() => {
    cleanupTestOutput();
  });

  it("should generate a nested translations types file from flattened keys", () => {
    const sampleContent = {
      TestInput: {
        buttonLabel: "PRESIONAR",
        buttonVal: "El valor del booleano es: {{value}}",
        inputVal: "El valor del TestInput es: {{value}}"
      },
      common: {
        hello: "Hola",
        title: "Esta pantalla no existe.",
        link: "Ir a pantalla de inicio!",
        hello2: "esto es una prueba hermano"
      },
      HomeScreen: {
        headerTitle: "¡Bienvenido! {{name}}",
        "step1.title": "Paso 1: Pruébalo",
        "step1.editText": "Editar",
        "step1.pressChanges": "para ver los cambios. Presiona",
        "step1.devTools": "para abrir las herramientas de desarrollador.",
        "step2.title": "Paso 2: Explora",
        "step2.description": "Toca la pestaña Explorar para aprender más.",
        "step3.title": "Paso 3: Comenzar de nuevo",
        "step3.runCommand": "Cuando estés listo, ejecuta",
        "step3.freshApp": "para obtener una nueva",
        "step3.appText": "aplicación",
        "step3.to": "a",
        "step3.moveDir": "directorio. Esto moverá el actual",
        "step3.appExample": "ejemplo-de-app",
        languageSelect: "Seleccionar Idioma"
      },
      TabTwoScreen: {
        exploreTitle: "Explorar",
        introduction: "Esta aplicación incluye código de ejemplo.",
        routingTitle: "Enrutamiento basado en archivos",
        routingScreens: "Esta aplicación tiene dos pantallas:",
        routingLayout: "El archivo de diseño en",
        routingSetsUp: "configura el navegador de pestañas.",
        routingLearnMore: "Aprende más",
        platformTitle: "Soporte para Android, iOS y web",
        platformDescription: "Puedes abrir este proyecto en Android, iOS y la web.",
        imagesTitle: "Imágenes",
        imagesDescription: "Para imágenes estáticas, puedes usar el",
        imagesAnd: "y",
        imagesSuffixes: "sufijos para diferentes densidades",
        fontsTitle: "Fuentes personalizadas",
        fontsDescription: "Abrir",
        fontsLoad: "para ver cómo cargar",
        fontsExample: "fuentes personalizadas",
        themeTitle: "Componentes de modo claro y oscuro",
        themeDescription: "Esta plantilla tiene soporte para modo claro y oscuro.",
        themeInspect: "permite inspeccionar el esquema de color",
        animationsTitle: "Animaciones",
        animationsDescription: "Ejemplo de componente animado.",
        animationsUses: "utiliza la potente",
        animationsLib: "biblioteca",
        animationsParallax: "efecto de paralaje",
        translateTitle: "Traducción y localización",
        translateDescription: "Gestiona traducciones.",
        translateInline: "definidas en línea",
        translateCli: "Ejecutar",
        translateGenerate: "para generar archivos",
        translateSwitch: "cambiar dinámicamente el idioma",
        translateLearnMore: "Aprende más"
      },
      TabLayout: {
        home: "Inicio",
        explore: "Explorar",
        yoyo: "Yoyo",
        nope: "Nope"
      }
    };

    const filePath = generateTranslationTypesFile(sampleContent, TEST_OUTPUT_DIR);
    expect(fs.existsSync(filePath)).toBe(true);

    const fileContent = fs.readFileSync(filePath, "utf-8");
    // Verify that the file exports a nested Translations type.
    expect(fileContent).toContain("export type Translations = {");
    // Check that HomeScreen now nests step1, step2, and step3 properly.
    expect(fileContent).toContain("HomeScreen: {");
    expect(fileContent).toContain("headerTitle: string;");
    expect(fileContent).toContain("step1: {");
    expect(fileContent).toContain("title: string;");
    expect(fileContent).toContain("editText: string;");
    expect(fileContent).toContain("step2: {");
    expect(fileContent).toContain("description: string;");
    // Ensure that no keys are left in dot notation.
    expect(fileContent).not.toContain('"step1.title"');
    expect(fileContent).not.toContain('"step1.editText"');
  });
});
