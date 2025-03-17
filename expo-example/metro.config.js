const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies through the workspace directory
config.resolver.disableHierarchicalLookup = true;

// 4. Add specific exclusions for build artifacts and source maps
config.resolver.blockList = exclusionList([
  // Exclude all files in the root node_modules
  new RegExp(`${workspaceRoot}/node_modules/[^/]+/node_modules/.*`),
  // Exclude source maps
  /\.map$/,
  // Exclude the source TypeScript files (we'll use the compiled ones)
  new RegExp(`${workspaceRoot}/src/.*`),
]);

// 5. Configure extra file extensions to handle
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;