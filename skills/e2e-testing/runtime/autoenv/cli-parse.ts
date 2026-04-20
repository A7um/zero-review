import { Command, CommanderError, InvalidArgumentError } from "commander";
import { resolve } from "path";

export interface SandboxOptions {
  mounts: string[];
  network: "none" | "bridge" | "host";
  env: string[];
  cpus?: number;
  memory?: string;
  readOnly: boolean;
  user?: string;
  port?: number;
}

export type TestingEnvPolicy = "mock" | "prompt";

export interface TestingOptions {
  enabled: boolean;
  goal?: string;
  paths: string[];
  output?: string;
  timeout?: number;
  envPolicy: TestingEnvPolicy;
}

export interface DynamicSetupOptions {
  enabled: boolean;
  baseImage?: string;
  timeout?: number;
}

export interface SetupCommandParsed {
  verbose: boolean;
  force: boolean;
  rebuild: boolean;
  tag?: string;
  sandbox: SandboxOptions;
  dynamicSetup: DynamicSetupOptions;
  repoUrl: string;
  containerArgs: string[];
}

export interface TestCommandParsed {
  verbose: boolean;
  force: boolean;
  tag?: string;
  sandbox: SandboxOptions;
  testing: TestingOptions;
  setupForTest: DynamicSetupOptions;
  repoUrl: string;
}

type SetupCliOptions = {
  verbose?: boolean;
  force?: boolean;
  rebuild?: boolean;
  tag?: string;
  mount?: string[];
  network?: "none" | "bridge" | "host";
  env?: string[];
  cpus?: number;
  memory?: string;
  noInternet?: boolean;
  readOnly?: boolean;
  user?: string;
  port?: number;
  setupBaseImage?: string;
  setupTimeout?: number;
};

type TestCliOptions = {
  verbose?: boolean;
  force?: boolean;
  tag?: string;
  mount?: string[];
  network?: "none" | "bridge" | "host";
  env?: string[];
  cpus?: number;
  memory?: string;
  noInternet?: boolean;
  readOnly?: boolean;
  user?: string;
  port?: number;
  testMode?: TestingEnvPolicy;
  testPath?: string[];
  testOutput?: string;
  testTimeout?: number;
  setupBaseImage?: string;
};

function defaultSandbox(): SandboxOptions {
  return {
    mounts: [],
    network: "none",
    env: [],
    readOnly: false,
  };
}

export function isGitHubUrl(arg: string): boolean {
  return /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(arg)
    || /^git@github\.com:[\w.-]+\/[\w.-]+/.test(arg);
}

export function isLocalPath(arg: string): boolean {
  return arg.startsWith(".") || arg.startsWith("/") || arg.startsWith("~");
}

function collectString(value: string, previous: string[] = []): string[] {
  return [...previous, value];
}

function parseNetworkMode(value: string): "none" | "bridge" | "host" {
  if (value === "none" || value === "bridge" || value === "host") {
    return value;
  }
  throw new InvalidArgumentError(`Invalid network mode: ${value}`);
}

function parseNumber(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new InvalidArgumentError(`Invalid ${label}: ${value}`);
  }
  return parsed;
}

function parseMount(value: string, previous: string[] = []): string[] {
  const parts = value.split(":");
  const src = parts[0];
  const dst = parts[1];
  if (!src || !dst) {
    throw new InvalidArgumentError(`Invalid mount: ${value}. Expected <src:dst>.`);
  }
  return [...previous, `${resolve(src)}:${dst}`];
}

function createSilentCommand(name: string): Command {
  return new Command(name)
    .exitOverride()
    .showHelpAfterError()
    .configureOutput({
      writeOut: () => {},
      writeErr: () => {},
      outputError: () => {},
    });
}

function createRootHelpCommand(): Command {
  const root = createSilentCommand("autoenv")
    .description("Set up and test repository environments in Docker")
    .usage("[command]")
    .addHelpText("after", `
Interactive mode:
  In an interactive terminal, missing required inputs are prompted for automatically.

Examples:
  autoenv
  autoenv setup https://github.com/BurntSushi/ripgrep
  autoenv setup --mount .:/work https://github.com/user/repo make test
  autoenv test --test-mode mock https://github.com/user/app "Confirm CLI prints help"
  autoenv test -e FOO=bar ./my-repo verify the login flow works
`.trimEnd());

  root.command("setup").description("AI-driven dev environment in a container (dynamic setup + shell or run)");
  root.command("test").description("Autonomous verification of a feature with saved reports");
  return root;
}

function applySharedOptions(command: Command): Command {
  return command
    .option("-v, --verbose", "Verbose output")
    .option("-f, --force", "Force refresh")
    .option("--tag <tag>", "Git tag or branch for remote clones")
    .option("-m, --mount <src:dst>", "Mount host path", parseMount, [])
    .option("--network <mode>", "Docker network mode", parseNetworkMode)
    .option("-e, --env <KEY=val>", "Environment variable", collectString, [])
    .option("--cpus <n>", "CPU limit", (value) => parseNumber(value, "cpus"))
    .option("--memory <size>", "Memory limit")
    .option("--no-internet", "Same as --network none")
    .option("--read-only", "Read-only container filesystem")
    .option("--user <uid:gid>", "Run as user")
    .option("-p, --port <port>", "Publish port", (value) => parseNumber(value, "port"));
}

function mapSandboxOptions(options: SetupCliOptions | TestCliOptions): SandboxOptions {
  return {
    mounts: options.mount ?? [],
    network: options.noInternet ? "none" : (options.network ?? "none"),
    env: options.env ?? [],
    cpus: options.cpus,
    memory: options.memory,
    readOnly: Boolean(options.readOnly),
    user: options.user,
    port: options.port,
  };
}

function handleCommanderError(error: unknown, repoLabel: string, goalLabel?: string): never {
  if (error instanceof CommanderError) {
    if (error.code === "commander.helpDisplayed") {
      throw new Error("__HELP__");
    }
    if (error.code === "commander.missingArgument") {
      if (error.message.includes(goalLabel ?? "__never__")) {
        throw new Error("Missing testing goal after repository. Add a goal string.");
      }
      if (error.message.includes(repoLabel)) {
        throw new Error(`Missing repository URL or path for ${goalLabel ? "test" : "setup"}.`);
      }
    }
    throw new Error(error.message);
  }
  throw error instanceof Error ? error : new Error(String(error));
}

function createSetupParser(): Command {
  return applySharedOptions(createSilentCommand("setup"))
    .enablePositionalOptions()
    .passThroughOptions()
    .argument("<repoUrl>", "Repository URL or local path")
    .argument("[containerArgs...]", "Command to run in the prepared image")
    .option("--rebuild", "Force rebuild of setup image")
    .option("--setup-base-image <img>", "Base image instead of default Ubuntu toolchain image")
    .option("--setup-timeout <secs>", "Agent time budget", (value) => parseNumber(value, "setup-timeout"));
}

function createTestParser(): Command {
  return applySharedOptions(createSilentCommand("test"))
    .argument("<repoUrl>", "Repository URL or local path")
    .argument("<goal...>", "Testing goal")
    .option("--test-mode <mode>", "Environment strategy", (value) => {
      if (value === "mock" || value === "prompt") {
        return value;
      }
      throw new InvalidArgumentError("Invalid --test-mode; use mock or prompt.");
    })
    .option("--test-path <path>", "Extra local codebase", (value, previous: string[] = []) => [...previous, resolve(value)], [])
    .option("--test-output <path>", "Host directory for report artifacts", (value) => resolve(value))
    .option("--test-timeout <secs>", "Agent time budget", (value) => parseNumber(value, "test-timeout"))
    .option("--setup-base-image <img>", "Test container base image");
}

function buildSetupResult(options: SetupCliOptions, repoUrl: string, containerArgs: string[]): SetupCommandParsed {
  const dynamicSetup: DynamicSetupOptions = {
    enabled: true,
    ...(options.setupBaseImage ? { baseImage: options.setupBaseImage } : {}),
    ...(options.setupTimeout !== undefined ? { timeout: options.setupTimeout * 1000 } : {}),
  };

  return {
    verbose: Boolean(options.verbose),
    force: Boolean(options.force),
    rebuild: Boolean(options.rebuild),
    tag: options.tag,
    sandbox: mapSandboxOptions(options),
    dynamicSetup,
    repoUrl,
    containerArgs,
  };
}

function buildTestResult(options: TestCliOptions, repoUrl: string, goalParts: string[]): TestCommandParsed {
  return {
    verbose: Boolean(options.verbose),
    force: Boolean(options.force),
    tag: options.tag,
    sandbox: mapSandboxOptions(options),
    testing: {
      enabled: true,
      goal: goalParts.join(" ").trim(),
      paths: options.testPath ?? [],
      output: options.testOutput,
      timeout: options.testTimeout !== undefined ? options.testTimeout * 1000 : undefined,
      envPolicy: options.testMode ?? "mock",
    },
    setupForTest: {
      enabled: false,
      ...(options.setupBaseImage ? { baseImage: options.setupBaseImage } : {}),
    },
    repoUrl,
  };
}

export function getSetupHelpText(): string {
  return createSetupParser().helpInformation();
}

export function getTestHelpText(): string {
  return createTestParser().helpInformation();
}

export function getRootHelpText(): string {
  return createRootHelpCommand().helpInformation();
}

export const HELP_TEXT = getRootHelpText();

export function parseSetupArgv(argv: string[]): SetupCommandParsed {
  let parsed: SetupCommandParsed | undefined;
  const command = createSetupParser().action((repoUrl: string, containerArgs: string[] | undefined, options: SetupCliOptions) => {
    parsed = buildSetupResult(options, repoUrl, containerArgs ?? []);
  });

  try {
    command.parse(argv, { from: "user" });
  } catch (error) {
    handleCommanderError(error, "repoUrl");
  }

  if (!parsed) {
    throw new Error("Failed to parse setup arguments.");
  }
  return parsed;
}

export function parseTestArgv(argv: string[]): TestCommandParsed {
  let parsed: TestCommandParsed | undefined;
  const command = createTestParser().action((repoUrl: string, goalParts: string[] | undefined, options: TestCliOptions) => {
    parsed = buildTestResult(options, repoUrl, goalParts ?? []);
  });

  try {
    command.parse(argv, { from: "user" });
  } catch (error) {
    handleCommanderError(error, "repoUrl", "goal");
  }

  if (!parsed) {
    throw new Error("Failed to parse test arguments.");
  }
  if (!parsed.testing.goal) {
    throw new Error("Missing testing goal after repository. Add a goal string.");
  }
  return parsed;
}
