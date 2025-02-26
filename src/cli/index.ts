#!/usr/bin/env node
import { program } from "commander";

import { createGenerateCommand } from "./generateCommand";
import { createPullCommand } from "./pullCommand";
import { createPushCommand } from "./pushCommand";
import { createGenerateTypesCommand } from "./generateTypesCommand";

program.addCommand(createGenerateCommand());
program.addCommand(createPullCommand());
program.addCommand(createPushCommand());
program.addCommand(createGenerateTypesCommand());

process.on("SIGINT", () => {
  console.log(" Terminating translate-sheet execution");
  process.exit(1);
});

program.parse(process.argv);
