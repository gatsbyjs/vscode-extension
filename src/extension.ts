import * as walk from "walkdir";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { workspace, window } from "vscode";
import { registerCommands } from "./commands";

const pluginName = "gatsby-plugin-graphql-config";
const pluginLink = `[${pluginName}](https://www.gatsbyjs.com/plugins/${pluginName}/)`;

const walkDirectoriesForGatsbyConfig: (
  string: string
) => Promise<string | null> = (basePath: string) =>
  new Promise((res, rej) => {
    const walker = walk(basePath, {
      no_return: true,
      filter: async (_directory, files) =>
        files.filter((f) => f && !f.includes("node_modules")),
    });
    let installPath: string | null = null;

    walker.on("file", function (filename) {
      if (filename.includes("gatsby-config.")) {
        installPath = dirname(filename);
        console.log("gatsby-config found!", filename, dirname(filename));
      }
    });

    walker.on("error", (err) => rej(err));
    walker.on("end", () => {
      if (installPath) {
        res(installPath);
      } else {
        res(null);
      }
    });
  });

export async function activate(): Promise<void> {
  registerCommands();
  if (workspace.workspaceFolders) {
    const paths = await Promise.all(
      workspace.workspaceFolders.map((path) =>
        walkDirectoriesForGatsbyConfig(path.uri.fsPath)
      )
    );
    const config = workspace.getConfiguration("graphql-config.load");
    // just set the first valid gatsby path for now
    await Promise.all(
      paths
        .filter((p) => p)
        .map(async (path) => {
          if (!path) {
            return;
          }
          if (!config.rootDir) {
            await config.update("rootDir", join(path, ".cache"));
            window.showInformationMessage(
              `Gatsby Extension Path configured in workspace settings - please make sure ${pluginLink} is enabled in gatsby-config`
            );
          }
          const pkgPath = join(path, "package.json");
          if (!existsSync(pkgPath)) {
            return;
          }
          const pkg = JSON.parse(
            readFileSync(pkgPath, {
              encoding: "utf8",
            })
          );
          if (!pkg?.dependencies[pluginName]) {
            throw Error(
              `You must install ${pluginLink} in ${pkgPath} to use the Gatsby extension`
            );
          }
        })
    ).catch((err) => {
      if (err.toString().includes(pluginName)) {
        window.showWarningMessage(err.toString());
      } else {
        console.error(err);
      }
    });
  }
}
