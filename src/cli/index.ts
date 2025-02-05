#!/usr/bin/env node

import { program } from "commander";

import { createGenerateCommand } from "./generateCommand";
import { createPullCommand } from "./pullCommand";

program.addCommand(createGenerateCommand());
program.addCommand(createPullCommand());

process.on("SIGINT", () => {
  console.log(" Terminating translate-sheet execution");
  process.exit(1);
});

program.parse(process.argv);
