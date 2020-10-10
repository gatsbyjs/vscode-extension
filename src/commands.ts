import { commands, workspace } from "vscode";

async function openNewTerminalWith(commandString: string): Promise<void> {
  await commands.executeCommand("workbench.action.terminal.new");

  await commands.executeCommand("workbench.action.terminal.sendSequence", {
    text: commandString,
  });
}

console.log(commands.getCommands());

export async function registerCommands(): Promise<void> {
  const { runWith } = await workspace.getConfiguration("gatsby.cli");
  console.log({ runWith });
  commands.registerCommand(
    "gatsby.cli.develop",
    async () => await openNewTerminalWith(`${runWith} develop`)
  );
  commands.registerCommand(
    "gatsby.cli.clean",
    async () => await openNewTerminalWith(`${runWith} clean`)
  );
  commands.registerCommand(
    "gatsby.cli.build",
    async () => await openNewTerminalWith(`${runWith} build`)
  );
  commands.registerCommand(
    "gatsby.cli.serve",
    async () => await openNewTerminalWith(`${runWith} serve`)
  );
  commands.registerCommand(
    "gatsby.cli.recipies",
    async () => await openNewTerminalWith(`${runWith} recipies`)
  );
}
