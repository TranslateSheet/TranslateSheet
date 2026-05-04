import * as glob from "glob";
import fs from "fs";
import path from "path";
import * as parser from "@babel/parser";
import _traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { flattenTranslations } from "./flattenTranslation";

// `@babel/traverse` is shipped as CJS with a default export; depending on how
// the consumer's bundler interops, the function lives at `.default` or at the
// module root. Handle both.
const traverse: typeof _traverse =
  (_traverse as any).default ?? (_traverse as any);

// File extensions Babel can parse with the typescript+jsx plugins. We
// intentionally drop .mdx/.vue/.json — they require dedicated parsers, and the
// previous regex extractor only matched them by accident.
const SUPPORTED_EXTENSIONS = ["ts", "tsx", "js", "jsx", "mjs", "cjs"] as const;
const FILE_GLOB = `**/*.{${SUPPORTED_EXTENSIONS.join(",")}}`;
const IGNORE_GLOBS = ["node_modules/**", "dist/**", "build/**"];

class ExtractError extends Error {}

const fail = (message: string): never => {
  console.error(`[TranslateSheet] ${message}`);
  process.exit(1);
  // process.exit() is already typed `never`, but ending the body with an
  // explicit throw guarantees TS narrows callers regardless of how it
  // interprets the call site (notably: arrow expressions inside conditionals,
  // where `never` propagation is unreliable across some TS versions).
  throw new Error(message);
};

const locOf = (node: t.Node, file: string) => {
  const line = node.loc?.start.line;
  return line ? `${file}:${line}` : file;
};

// Strip TS-only and grouping wrappers so `{ ... } as const`,
// `{ ... } satisfies T`, `({ ... })`, etc. all reach the underlying object.
const unwrap = (node: t.Expression | t.PatternLike): t.Node => {
  let current: t.Node = node;
  while (
    t.isTSAsExpression(current) ||
    t.isTSSatisfiesExpression(current) ||
    t.isTSTypeAssertion(current) ||
    t.isTSNonNullExpression(current) ||
    t.isParenthesizedExpression(current)
  ) {
    current = (current as any).expression;
  }
  return current;
};

// Read a string from a string literal or a template literal that has no
// `${...}` expressions. Returns null if the node is neither.
const readStaticString = (node: t.Node): string | null => {
  if (t.isStringLiteral(node)) return node.value;
  if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
    return node.quasis.map((q) => q.value.cooked ?? q.value.raw).join("");
  }
  return null;
};

// `asserts` predicate: TS narrows the parameter type at the call site based on
// this annotation, regardless of how `fail()` is implemented. We use this
// instead of inline `if (!isX(x)) fail(...)` because TS doesn't propagate
// `never`-returning arrow functions through narrowing reliably.
function assertObjectExpression(
  node: t.Node,
  file: string
): asserts node is t.ObjectExpression {
  if (!t.isObjectExpression(node)) {
    fail(
      `TranslateSheet.create() translations must be an inline object literal at ${locOf(
        node,
        file
      )}.`
    );
  }
}

// Extracted as a helper so its `never` return path is unambiguous to TS's
// narrowing — inline `if/else if/else { fail() }` chains weren't propagating
// definite-assignment for `key` across all branches.
const readObjectKey = (
  keyNode: t.Expression | t.PrivateName,
  file: string
): string => {
  if (t.isIdentifier(keyNode)) return keyNode.name;
  if (t.isStringLiteral(keyNode)) return keyNode.value;
  if (t.isNumericLiteral(keyNode)) return String(keyNode.value);
  return fail(
    `Unsupported key type "${keyNode.type}" at ${locOf(
      keyNode,
      file
    )}. Use identifier or string-literal keys.`
  );
};

const astObjectToPlain = (
  node: t.ObjectExpression,
  file: string
): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const prop of node.properties) {
    if (t.isSpreadElement(prop)) {
      fail(
        `Spread (...) is not supported in TranslateSheet.create() objects at ${locOf(
          prop,
          file
        )}. Inline the values instead.`
      );
    }
    if (t.isObjectMethod(prop)) {
      fail(
        `Method shorthand is not supported in TranslateSheet.create() objects at ${locOf(
          prop,
          file
        )}. Translation values must be string literals.`
      );
    }
    if (!t.isObjectProperty(prop)) continue;

    if (prop.computed) {
      fail(
        `Computed keys are not supported in TranslateSheet.create() objects at ${locOf(
          prop,
          file
        )}. Use plain identifier or string-literal keys.`
      );
    }

    const key = readObjectKey(prop.key, file);

    const value = unwrap(prop.value as t.Expression);

    const staticString = readStaticString(value);
    if (staticString !== null) {
      result[key] = staticString;
      continue;
    }
    if (t.isObjectExpression(value)) {
      result[key] = astObjectToPlain(value, file);
      continue;
    }

    fail(
      `Translation values must be string literals or nested objects. Got "${(value as t.Node).type}" for key "${key}" at ${locOf(
        value as t.Node,
        file
      )}.`
    );
  }

  return result;
};

/**
 * Extract translations from the codebase by parsing each source file into an
 * AST and walking it for `TranslateSheet.create("namespace", { ... })` calls.
 *
 * Failure modes are loud: malformed translation objects (spread, computed keys,
 * non-literal values, dynamic namespaces) cause a process.exit(1) with the
 * file:line of the offending node. The previous regex+eval extractor would
 * silently drop these and ship incomplete translations.
 */
const extractTranslateSheetObjects = (): Record<string, any> => {
  const projectRoot = path.resolve(".");
  const files = glob.sync(FILE_GLOB, { ignore: IGNORE_GLOBS });

  const translations: Record<string, any> = {};
  const seenKeysByNamespace = new Map<string, Map<string, string>>();

  for (const file of files) {
    const filePath = path.resolve(file);
    if (fs.statSync(filePath).isDirectory()) continue;
    const relativeFilePath = path.relative(projectRoot, filePath);

    const source = fs.readFileSync(filePath, "utf-8");

    // Fast path: skip files that obviously don't reference TranslateSheet.
    // Saves Babel parse cost on the 99% of files that aren't translation hosts.
    if (!source.includes("TranslateSheet.create")) continue;

    let ast: t.File;
    try {
      ast = parser.parse(source, {
        sourceType: "unambiguous",
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true,
        allowImportExportEverywhere: true,
        plugins: [
          "typescript",
          "jsx",
          "decorators-legacy",
          "classProperties",
          "objectRestSpread",
          "topLevelAwait",
        ],
      });
    } catch (error) {
      console.error(
        `[TranslateSheet] Failed to parse ${relativeFilePath}: ${
          (error as Error).message
        }`
      );
      continue;
    }

    traverse(ast, {
      CallExpression(callPath: NodePath<t.CallExpression>) {
        const { callee, arguments: args } = callPath.node;
        if (!t.isMemberExpression(callee) || callee.computed) return;
        if (!t.isIdentifier(callee.object, { name: "TranslateSheet" })) return;
        if (!t.isIdentifier(callee.property, { name: "create" })) return;

        if (args.length < 2) {
          fail(
            `TranslateSheet.create() expects (namespace, translations) at ${locOf(
              callPath.node,
              relativeFilePath
            )}.`
          );
        }

        const nsArg = unwrap(args[0] as t.Expression);
        const namespace =
          readStaticString(nsArg) ??
          fail(
            `TranslateSheet.create() namespace must be a string literal at ${locOf(
              nsArg,
              relativeFilePath
            )}.`
          );

        const objArg = unwrap(args[1] as t.Expression);
        assertObjectExpression(objArg, relativeFilePath);

        const translationObject = astObjectToPlain(objArg, relativeFilePath);
        const flattened = flattenTranslations(translationObject);

        if (!translations[namespace]) {
          translations[namespace] = {};
          seenKeysByNamespace.set(namespace, new Map());
        }
        const existingKeys = seenKeysByNamespace.get(namespace)!;

        for (const [key, value] of Object.entries(flattened)) {
          if (existingKeys.has(key)) {
            console.error(
              `[TranslateSheet] Duplicate key detected: "${namespace}.${key}"` +
                `\n - First found in: ${existingKeys.get(key)}` +
                `\n - Also found in: ${relativeFilePath}`
            );
            process.exit(1);
          }
          existingKeys.set(key, relativeFilePath);
          translations[namespace][key] = value;
        }
      },
    });
  }

  return translations;
};

export default extractTranslateSheetObjects;
