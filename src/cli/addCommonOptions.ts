import { Command } from "commander";
import { commonOptions } from "./commonOptions";

export function addCommonOptions(cmd: Command): Command {
  commonOptions.forEach((option) => {
    if (option.defaultValue !== undefined) {
      cmd.option(option.flags, option.description, option.defaultValue);
    } else {
      cmd.option(option.flags, option.description);
    }
  });
  return cmd;
}
