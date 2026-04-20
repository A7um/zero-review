import { confirm, input, select } from "@inquirer/prompts";
import {
  isGitHubUrl,
  isLocalPath,
  parseSetupArgv,
  parseTestArgv,
  type SetupCommandParsed,
  type TestCommandParsed,
  type TestingEnvPolicy,
} from "./cli-parse";

type PromptChoice<T extends string> = {
  name: string;
  value: T;
  description?: string;
};

export interface PromptApi {
  input: (options: {
    message: string;
    default?: string;
    required?: boolean;
    validate?: (value: string) => true | string | Promise<true | string>;
  }) => Promise<string>;
  confirm: (options: {
    message: string;
    default?: boolean;
  }) => Promise<boolean>;
  select: <T extends string>(options: {
    message: string;
    choices: PromptChoice<T>[];
  }) => Promise<T>;
}

const defaultPrompts: PromptApi = {
  input,
  confirm,
  select,
};

function canPromptInteractively(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

function parseCommandString(command: string): string[] {
  const parts = command.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  return parts.map((part) => {
    if (
      (part.startsWith("\"") && part.endsWith("\""))
      || (part.startsWith("'") && part.endsWith("'"))
    ) {
      return part.slice(1, -1);
    }
    return part;
  });
}

function repoValidator(value: string): true | string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Repository URL or local path is required.";
  }
  if (isGitHubUrl(trimmed) || isLocalPath(trimmed)) {
    return true;
  }
  return "Enter a GitHub URL or a local path.";
}

function hasExplicitTestMode(argv: string[]): boolean {
  return argv.includes("--test-mode");
}

async function promptForRepo(prompts: PromptApi): Promise<string> {
  return await prompts.input({
    message: "Repository URL or local path",
    required: true,
    validate: repoValidator,
  });
}

async function promptForGoal(prompts: PromptApi): Promise<string> {
  return await prompts.input({
    message: "What do you want to verify?",
    required: true,
    validate: (value) => value.trim().length > 0 || "A testing goal is required.",
  });
}

async function promptForTestMode(prompts: PromptApi): Promise<TestingEnvPolicy> {
  return await prompts.select({
    message: "Testing mode",
    choices: [
      {
        name: "mock",
        value: "mock",
        description: "Prefer self-contained verification without external credentials",
      },
      {
        name: "prompt",
        value: "prompt",
        description: "Ask for the minimal env vars needed for real verification",
      },
    ],
  });
}

export async function maybePromptForTopLevelInvocation(
  argv: string[],
  prompts: PromptApi = defaultPrompts,
  allowInteractive = canPromptInteractively(),
): Promise<string[]> {
  if (argv.length > 0 || !allowInteractive) {
    return argv;
  }

  const command = await prompts.select({
    message: "What would you like to do?",
    choices: [
      {
        name: "setup",
        value: "setup",
        description: "Prepare a reusable dev environment image, then open a shell or run a command",
      },
      {
        name: "test",
        value: "test",
        description: "Run goal-driven verification and save test artifacts",
      },
    ],
  });

  if (command === "setup") {
    const repoUrl = await promptForRepo(prompts);
    const openShell = await prompts.confirm({
      message: "Open an interactive shell after setup?",
      default: true,
    });

    if (openShell) {
      return ["setup", repoUrl];
    }

    const commandLine = await prompts.input({
      message: "Command to run after setup",
      required: true,
      validate: (value) => value.trim().length > 0 || "Enter a command to run.",
    });

    return ["setup", repoUrl, ...parseCommandString(commandLine)];
  }

  const repoUrl = await promptForRepo(prompts);
  const testMode = await promptForTestMode(prompts);
  const goal = await promptForGoal(prompts);
  return ["test", "--test-mode", testMode, repoUrl, goal];
}

export async function resolveSetupArgsWithPrompts(
  argv: string[],
  prompts: PromptApi = defaultPrompts,
  allowInteractive = canPromptInteractively(),
): Promise<SetupCommandParsed> {
  try {
    return parseSetupArgv(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!allowInteractive || message !== "Missing repository URL or path for setup.") {
      throw error;
    }

    const repoUrl = await promptForRepo(prompts);
    return parseSetupArgv([...argv, repoUrl]);
  }
}

export async function resolveTestArgsWithPrompts(
  argv: string[],
  prompts: PromptApi = defaultPrompts,
  allowInteractive = canPromptInteractively(),
): Promise<TestCommandParsed> {
  try {
    return parseTestArgv(argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!allowInteractive) {
      throw error;
    }

    if (message === "Missing repository URL or path for test.") {
      const extraArgs = [...argv];
      if (!hasExplicitTestMode(argv)) {
        extraArgs.unshift(await promptForTestMode(prompts));
        extraArgs.unshift("--test-mode");
      }

      const repoUrl = await promptForRepo(prompts);
      const goal = await promptForGoal(prompts);
      return parseTestArgv([...extraArgs, repoUrl, goal]);
    }

    if (message === "Missing testing goal after repository. Add a goal string.") {
      const goal = await promptForGoal(prompts);
      return parseTestArgv([...argv, goal]);
    }

    throw error;
  }
}
