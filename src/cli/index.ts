#!/usr/bin/env node

import { program } from "commander";

import { createGenerateCommand } from "./generateCommand";
import { createPullCommand } from "./pullCommand";

program.addCommand(createGenerateCommand());
program.addCommand(createPullCommand());

/**
 * Command-line interface setup with Commander.
 */

program.parse(process.argv);
