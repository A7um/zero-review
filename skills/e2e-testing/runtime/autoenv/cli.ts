#!/usr/bin/env bun
import { $ } from "bun";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";
import type {
  BashOperations, ReadOperations, WriteOperations,
  EditOperations, GrepOperations, FindOperations, LsOperations,
} from "@mariozechner/pi-coding-agent";
import {
  getRootHelpText,
  getSetupHelpText,
  getTestHelpText,
  isLocalPath,
} from "./cli-parse";
import type {
  DynamicSetupOptions,
  SandboxOptions,
  SetupCommandParsed,
  TestCommandParsed,
  TestingEnvPolicy,
  TestingOptions,
} from "./cli-parse";
import {
  maybePromptForTopLevelInvocation,
  resolveSetupArgsWithPrompts,
  resolveTestArgsWithPrompts,
} from "./cli-prompts";

interface RepoMetadata {
  url: string;
  owner: string;
  repo: string;
  commitHash: string;
  createdAt: string;
  lastUsed: string;
  tag?: string;
}

const CACHE_DIR = join(homedir(), ".autoenv", "cache");
const METADATA_FILE = ".autoenv-metadata.json";
const RUNTIME_PI_PACKAGE_JSON = JSON.stringify({
  name: "autoenv",
  version: "1.0.0",
  type: "module",
}, null, 2);

let piCodingAgentModulePromise: Promise<typeof import("@mariozechner/pi-coding-agent")> | undefined;

function log(msg: string, verbose = false) {
  if (!verbose || process.env.AUTOENV_VERBOSE) {
    console.error(`[autoenv] ${msg}`);
  }
}

function logStep(step: string) {
  console.error(`[autoenv]   -> ${step}`);
}

async function ensurePiPackageDir(): Promise<void> {
  if (process.env.PI_PACKAGE_DIR) {
    return;
  }

  const candidates = [
    import.meta.dir,
    dirname(process.execPath),
    process.cwd(),
  ];

  for (const dir of candidates) {
    const packageJsonPath = join(dir, "package.json");
    if (await Bun.file(packageJsonPath).exists()) {
      process.env.PI_PACKAGE_DIR = dir;
      return;
    }
  }

  const runtimeDir = join(homedir(), ".autoenv", "runtime-package");
  await $`mkdir -p ${runtimeDir}`.quiet();
  const runtimePackageJsonPath = join(runtimeDir, "package.json");
  if (!await Bun.file(runtimePackageJsonPath).exists()) {
    await Bun.write(runtimePackageJsonPath, RUNTIME_PI_PACKAGE_JSON);
  }
  process.env.PI_PACKAGE_DIR = runtimeDir;
}

async function getPiCodingAgentModule() {
  await ensurePiPackageDir();
  if (!piCodingAgentModulePromise) {
    piCodingAgentModulePromise = import("@mariozechner/pi-coding-agent");
  }
  return await piCodingAgentModulePromise;
}

function parseRepoUrl(url: string): { owner: string; repo: string } {
  const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/);
  if (httpsMatch && httpsMatch[1] && httpsMatch[2]) {
    return { owner: httpsMatch[1], repo: httpsMatch[2].replace(/\.git$/, "") };
  }
  const sshMatch = url.match(/git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (sshMatch && sshMatch[1] && sshMatch[2]) {
    return { owner: sshMatch[1], repo: sshMatch[2].replace(/\.git$/, "") };
  }
  throw new Error(`Invalid GitHub URL: ${url}`);
}

function getCacheKey(owner: string, repo: string, commitHash: string): string {
  return `${owner}_${repo}_${commitHash.substring(0, 8)}`;
}

function getImageName(owner: string, repo: string): string {
  return `autoenv-${owner}-${repo}`.toLowerCase();
}

async function ensureCacheDir(): Promise<void> {
  await $`mkdir -p ${CACHE_DIR}`.quiet();
}

async function imageExists(imageName: string): Promise<boolean> {
  const result = await $`docker images -q ${imageName}`.quiet().nothrow();
  return result.text().trim().length > 0;
}

async function cloneOrCache(url: string, force: boolean, verbose: boolean, tag?: string): Promise<string> {
  await ensureCacheDir();

  const { owner, repo } = parseRepoUrl(url);

  const ref = tag ? `refs/tags/${tag}` : "HEAD";
  const displayName = tag ? `${owner}/${repo}@${tag}` : `${owner}/${repo}`;
  log(`Checking ${displayName}...`, !verbose);

  const lsRemoteResult = await $`git ls-remote ${url} ${ref}`.quiet();
  const lsRemoteText = lsRemoteResult.text().trim();

  if (!lsRemoteText) {
    throw new Error(tag ? `Tag '${tag}' not found in repository` : `Repository not found`);
  }

  const commitHash = lsRemoteText.split("\t")[0] || "unknown";
  const cacheIdentifier = tag ? `tag_${tag}` : commitHash;
  const cacheKey = getCacheKey(owner, repo, cacheIdentifier);
  const repoPath = join(CACHE_DIR, cacheKey);
  const metadataPath = join(repoPath, METADATA_FILE);

  const repoExists = await Bun.file(metadataPath).exists();

  if (repoExists && !force) {
    log(`Using cached version: ${cacheKey}`, !verbose);
    const metadata: RepoMetadata = await Bun.file(metadataPath).json();
    metadata.lastUsed = new Date().toISOString();
    await Bun.write(metadataPath, JSON.stringify(metadata, null, 2));
    return repoPath;
  }

  if (repoExists) {
    log("Removing old cache...", !verbose);
    await $`rm -rf ${repoPath}`.quiet();
  }

  log(`Cloning ${displayName}...`, !verbose);
  const cloneCmd = tag
    ? $`git clone --depth 1 --branch ${tag} ${url} ${repoPath}`
    : $`git clone --depth 1 ${url} ${repoPath}`;
  await cloneCmd.quiet();

  const metadata: RepoMetadata = {
    url,
    owner,
    repo,
    commitHash,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    ...(tag && { tag }),
  };
  await Bun.write(metadataPath, JSON.stringify(metadata, null, 2));

  return repoPath;
}

function buildDockerArgs(
  opts: SandboxOptions,
  imageName: string,
  containerArgs: string[]
): string[] {
  const args = ["run", "--rm"];

  if (process.stdin.isTTY) {
    args.push("-it");
  } else {
    args.push("-i");
  }

  args.push("--network", opts.network);

  if (opts.readOnly) {
    args.push("--read-only");
  }

  if (opts.cpus) {
    args.push("--cpus", String(opts.cpus));
  }
  if (opts.memory) {
    args.push("--memory", opts.memory);
  }

  if (opts.user) {
    args.push("--user", opts.user);
  }

  for (const mount of opts.mounts) {
    args.push("-v", mount);
  }

  for (const env of opts.env) {
    args.push("-e", env);
  }

  if (opts.port) {
    args.push("-p", `${opts.port}:${opts.port}`);
  }

  args.push(imageName);
  args.push(...containerArgs);

  return args;
}

const PROMPT_DYNAMIC_SETUP = `You are setting up a development environment inside a Docker container at /workspace.
The project source code has been copied to /workspace.

Your goal is to get the environment to a working state where we can build and develop the project.
The user will later drop into this container with a shell and work on the project.

Follow these steps:

1. **Analyze the project**: Read README.md, package.json, Makefile, Cargo.toml, go.mod, pyproject.toml, setup.py, or whatever build files exist.

2. **Check environment variables**: Run \`env\` to see what's available. The user may have injected env vars via -e flags (API keys, database URLs, secrets). Use them when configuring the app.

3. **Install system dependencies**: Use apt-get to install any required system packages. Always run \`apt-get update\` first.

4. **Install language toolchains**: Install the appropriate language runtime/compiler (Rust via rustup, Go, Node.js, Python, etc.) if not already present.

5. **Install project dependencies**:
   - Node.js/Bun: \`bun install\` or \`npm install\`
   - Python: \`pip3 install -r requirements.txt\` or \`pip3 install -e .\`
   - Rust: just install deps, don't need to build release yet
   - Go: \`go mod download\`
   - etc.

6. **Build the project** to verify it compiles/works.

7. **Quick smoke test**: Verify the build succeeded (e.g., run the binary with --version or --help).

8. **Create entrypoint script**: Write /workspace/.autoenv-entrypoint.sh that:
   - Is executable (chmod +x)
   - Uses #!/bin/bash
   - Execs the main binary/server with "$@" for arg passthrough
   - Example: \`#!/bin/bash\nexec /workspace/target/release/mybinary "$@"\`

9. **Clean up** apt lists only: \`rm -rf /var/lib/apt/lists/*\`
   - Do NOT run \`cargo clean\`, \`npm prune\`, or delete build artifacts — the user needs a working dev environment.
   - Do NOT delete source code or the .git directory.

Be thorough but efficient. If something fails, diagnose and fix it.`;

const PROMPT_TESTING_MODE_BASE = `You are an autonomous testing agent inside a fresh Docker container.
The primary codebase is available at /workspace.
Additional local codebases, if any, are available under /workspace/test-inputs.
Host Docker is available via /var/run/docker.sock when you truly need multi-container orchestration.

Your job is to take a user-specified testing request, construct the MINIMAL environment required to verify it from scratch, run the verification, and produce evidence-backed artifacts.

Operating rules:
1. Read the primary repo's README/build files first. Inspect extra codebases only as needed.
2. Install only the minimum system/runtime dependencies required to perform the requested verification.
3. Prefer fast local/dev setup paths over production deployment paths.
4. If the feature is UI-driven, use a scriptable browser approach when needed (for example Playwright + Chromium) and save screenshots.
5. If Docker is the simplest path for a dependency stack, you may use it, but clean up any containers/networks/volumes you start.
6. Never claim success without concrete evidence from commands, tests, HTTP responses, screenshots, or logs.
7. If you hit a blocker, explain the exact blocker, preserve logs, and still write the report artifacts.

You MUST produce these files under /workspace/.autoenv-testing:
- report.json: machine-readable result with fields like status, summary, request, evidence, artifacts, and nextSteps
- report.md: human-readable report with setup steps, commands run, assertions checked, evidence, and final verdict
- demo.md: a concise demo transcript or walkthrough of how the feature was verified
- artifacts/command-log.txt: append the commands you run and the important output

Status rules:
- "passed": the requested behavior was verified with evidence
- "failed": the environment was built and the requested behavior did not work
- "inconclusive": you were blocked by missing prerequisites or ambiguous behavior

Before finishing, ensure report.md and report.json both exist even if the test fails or is inconclusive.`;

function buildTestingModeSystemPrompt(envPolicy: TestingEnvPolicy): string {
  if (envPolicy === "prompt") {
    return `${PROMPT_TESTING_MODE_BASE}

Testing env policy: prompt
- A minimal set of environment variables may be injected for this specific verification request.
- Prefer real verification of the feature under test using only the injected variables when they are relevant.
- Do not ask for more secrets interactively from inside the container. If the injected set is still insufficient, explain exactly what is missing and end as "inconclusive".
- You may still use local mocks or patches for unrelated services, but do not replace the core behavior under test with a fake if the real path is available.`;
  }

  return `${PROMPT_TESTING_MODE_BASE}

Testing env policy: mock
- Assume the user will not provide additional environment variables, API keys, or external service configuration beyond what is already injected.
- Prefer self-contained verification. You may edit source code, test configuration, or local dev wiring under /workspace to replace external dependencies with mocks, fakes, stubs, fixtures, or local services.
- Keep any such changes narrowly scoped to verification, document them in the report, and do not depend on real third-party credentials unless they are already injected.
- If the feature cannot be meaningfully verified without real external credentials, explain the blocker clearly and end as "inconclusive".`;
}

const PROMPT_ENV_VAR_SCAN = `You are analyzing a project at /workspace to detect environment variables the user should configure.

Your job: quickly find the environment variables and output structured JSON. Be fast — do NOT exhaustively grep source code.

Strategy (follow IN ORDER, stop when you have enough):
1. Check if .env.example, .env.sample, or .env.template exists. If so, read it — this is the authoritative source. Parse ALL variables from it (including commented-out ones like "# VAR_NAME=value"). Then STOP and output JSON.
2. If no env template file exists, read docker-compose.yml and look for \${VAR_NAME} patterns.
3. If still nothing, quickly skim README.md for mentioned environment variables.
4. As a LAST RESORT only, do a targeted grep for common patterns — but limit to 1-2 quick commands, not exhaustive searches.

For each variable output:
- **name**: The variable name
- **description**: What it does (from comments or context). Keep it short.
- **defaultValue**: Default value if any (empty string if none)
- **required**: true ONLY if the project clearly won't start without it. Most vars are optional.
- **category**: One of: "AI Providers", "API Keys", "Tokens & Secrets", "Database", "Authentication", "URLs & Endpoints", "Messaging & Chat", "Cloud & Infrastructure", "General"

DO NOT include: NODE_ENV, PATH, HOME, CI, DEBUG, TERM, PORT, test-only vars, OS detection vars, build tooling vars.

Output ONLY a raw JSON array. No markdown fences, no explanation, no text before or after the JSON.`;

function buildTestingEnvVarScanPrompt(goal: string): string {
  return `You are analyzing a project at /workspace to detect the MINIMAL set of environment variables required for a specific verification request.

Verification request:
${goal}

Your job: quickly find only the environment variables that are likely necessary to verify THIS request from scratch. Be fast — do NOT exhaustively grep source code.

Strategy (follow IN ORDER, stop when you have enough):
1. Check if .env.example, .env.sample, or .env.template exists. If so, read it first.
2. Read README.md or testing docs for setup instructions related to the requested behavior.
3. Check docker-compose.yml or similar config for \${VAR_NAME} patterns tied to the requested behavior.
4. As a LAST RESORT only, do a targeted grep for relevant integrations mentioned by the request.

Rules:
- Return the smallest practical set. Exclude unrelated optional integrations.
- Mark a variable as required only if the requested verification likely cannot proceed without it.
- If a local fallback or mock path is clearly supported by the repo, prefer omitting the real credential.
- Do NOT include: NODE_ENV, PATH, HOME, CI, DEBUG, TERM, PORT, test-only vars, OS detection vars, build tooling vars.

For each variable output:
- name: The variable name
- description: Why it matters for THIS verification request
- defaultValue: Default value if any (empty string if none)
- required: true only if this specific verification likely needs it
- category: One of: "AI Providers", "API Keys", "Tokens & Secrets", "Database", "Authentication", "URLs & Endpoints", "Messaging & Chat", "Cloud & Infrastructure", "General"

Output ONLY a raw JSON array. No markdown fences, no explanation, no text before or after the JSON.`;
}

interface DetectedEnvVar {
  name: string;
  description: string;
  defaultValue: string;
  required: boolean;
  category: string;
}

interface TestingReport {
  status?: string;
  summary?: string;
  request?: string;
  evidence?: unknown[];
  artifacts?: string[];
  nextSteps?: string[];
}

async function detectEnvVarsInContainer(
  containerId: string,
  systemPrompt: string,
  userPrompt: string,
  verbose: boolean,
): Promise<DetectedEnvVar[]> {
  const dockerTools = await createDockerTools(containerId);
  const model = getModel("anthropic", "claude-sonnet-4-5-20250929");

  const agent = new Agent({
    initialState: {
      systemPrompt,
      model,
      thinkingLevel: "medium",
      tools: dockerTools,
    },
    getApiKey: getAgentApiKey,
  });

  if (verbose) {
    agent.subscribe((event: any) => {
      if (event.type === "tool_execution_start") {
        const args = event.args || {};
        let detail = "";
        if (event.toolName === "bash") detail = (args.command || "").substring(0, 80);
        else if (event.toolName === "read") detail = args.file_path || args.path || "";
        else if (event.toolName === "grep") detail = args.pattern ? `/${args.pattern}/` : "";
        if (detail) logStep(`[env-scan] ${event.toolName}: ${detail}`);
      }
    });
  }

  const timeoutId = setTimeout(() => agent.abort(), 120000);

  try {
    await agent.prompt(userPrompt);

    const messages = agent.state.messages || [];
    let jsonText = "";
    for (const msg of messages) {
      if (msg.role === "assistant" && msg.content) {
        const content = Array.isArray(msg.content) ? msg.content : [msg.content];
        for (const block of content) {
          const text = typeof block === "string" ? block : (block as any).text || "";
          if (text) jsonText += text;
        }
      }
    }

    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((v: any) => v && typeof v.name === "string" && v.name.length > 0)
          .map((v: any) => ({
            name: String(v.name),
            description: String(v.description || ""),
            defaultValue: String(v.defaultValue || ""),
            required: Boolean(v.required),
            category: String(v.category || "General"),
          }));
      }
    }
    return [];
  } catch (err: any) {
    if (verbose) logStep(`[env-scan] Error: ${err.message}`);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

async function promptUserForEnvVars(detectedVars: DetectedEnvVar[]): Promise<string[]> {
  const grouped = new Map<string, DetectedEnvVar[]>();
  for (const v of detectedVars) {
    if (!grouped.has(v.category)) grouped.set(v.category, []);
    grouped.get(v.category)!.push(v);
  }

  const requiredVars = detectedVars.filter(v => v.required);
  const optionalVars = detectedVars.filter(v => !v.required);

  console.error("");
  console.error(`[autoenv] Found ${detectedVars.length} environment variable(s):`);
  console.error(`          ${requiredVars.length} required, ${optionalVars.length} optional`);
  console.error("");

  for (const [category, vars] of grouped) {
    const reqCount = vars.filter(v => v.required).length;
    console.error(`  ${category}${reqCount > 0 ? ` (${reqCount} required)` : ""}:`);
    for (const v of vars) {
      const tag = v.required ? " [REQUIRED]" : "";
      const desc = v.description ? ` - ${v.description}` : "";
      const def = v.defaultValue ? ` (default: ${v.defaultValue})` : "";
      console.error(`    ${v.name}${tag}${def}${desc}`);
    }
    console.error("");
  }

  const reader = require("readline").createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => reader.question(question, resolve));

  const result: string[] = [];

  if (requiredVars.length > 0) {
    console.error("[autoenv] Enter required environment variables (press Enter to skip):");
    console.error("");
    for (const v of requiredVars) {
      const desc = v.description ? ` (${v.description})` : "";
      const prompt = v.defaultValue
        ? `  ${v.name}${desc} [${v.defaultValue}]: `
        : `  ${v.name}${desc}: `;
      const answer = await ask(prompt);
      const value = answer.trim() || v.defaultValue;
      if (value) {
        result.push(`${v.name}=${value}`);
      }
    }
    console.error("");
  }

  if (optionalVars.length > 0) {
    const configOptional = await ask(
      `[autoenv] Configure ${optionalVars.length} optional variable(s)? (y/N): `
    );

    if (configOptional.trim().toLowerCase() === "y") {
      console.error("");
      console.error("[autoenv] Enter optional environment variables (press Enter to skip):");
      console.error("");
      for (const v of optionalVars) {
        const desc = v.description ? ` (${v.description})` : "";
        const prompt = v.defaultValue
          ? `  ${v.name}${desc} [${v.defaultValue}]: `
          : `  ${v.name}${desc}: `;
        const answer = await ask(prompt);
        const value = answer.trim() || v.defaultValue;
        if (value) {
          result.push(`${v.name}=${value}`);
        }
      }
    }
  }

  reader.close();
  console.error("");
  console.error(`[autoenv] Configured ${result.length} variable(s).`);
  return result;
}

function filterMissingEnvVars(detectedVars: DetectedEnvVar[], env: string[]): DetectedEnvVar[] {
  const providedNames = new Set(
    env
      .map((entry) => entry.split("=")[0]?.trim())
      .filter((name): name is string => Boolean(name))
  );
  return detectedVars.filter((variable) => !providedNames.has(variable.name));
}

async function getAgentApiKey(provider?: string): Promise<string | undefined> {
  try {
    const { AuthStorage } = await getPiCodingAgentModule();
    const authStorage = AuthStorage.create();
    const key = await authStorage.getApiKey(provider || "anthropic");
    if (key) return key;
  } catch {}
  return process.env.ANTHROPIC_API_KEY;
}

async function ensureAgentApiKey(): Promise<void> {
  if (await getAgentApiKey("anthropic")) {
    return;
  }
  throw new Error(
    "No Anthropic API key found. Set ANTHROPIC_API_KEY or log in via `pi login anthropic`."
  );
}

function subscribeAgentProgress(agent: Agent, verbose: boolean, prefix?: string) {
  if (!verbose) {
    return;
  }

  agent.subscribe((event: any) => {
    if (event.type === "tool_execution_start") {
      const args = event.args || {};
      let detail = "";
      switch (event.toolName) {
        case "bash": {
          const cmd = args.command || "";
          detail = cmd.length > 80 ? cmd.substring(0, 80) + "..." : cmd;
          break;
        }
        case "read":
        case "write":
        case "edit": {
          const p = args.file_path || args.path || "";
          detail = p.split("/").pop() || p;
          break;
        }
        case "grep":
          detail = args.pattern ? `/${args.pattern}/` : "";
          break;
        case "find":
          detail = args.pattern || args.glob || "";
          break;
        case "ls":
          detail = args.path || "";
          break;
      }
      const label = prefix ? `[${prefix}] ${event.toolName}` : event.toolName;
      logStep(detail ? `${label}: ${detail}` : label);
    }

    if (event.type === "tool_execution_end" && event.isError) {
      const errText = event.result?.content?.[0]?.text || "";
      const short = errText.length > 120 ? errText.substring(0, 120) + "..." : errText;
      const label = prefix ? `[${prefix}] ${event.toolName}` : event.toolName;
      logStep(`[error] ${label}: ${short}`);
    }
  });
}

async function detectAndPromptEnvVars(
  repoPath: string,
  baseImage: string,
  env: string[],
  verbose: boolean,
): Promise<string[]> {
  log("Analyzing project for environment variables...");
  const scanContainerName = `autoenv-envscan-${Date.now()}`;
  const scanRunArgs = [
    "run", "-d",
    "--name", scanContainerName,
    "--network", "bridge",
    baseImage,
    "tail", "-f", "/dev/null",
  ];
  await $`docker ${scanRunArgs}`.quiet();
  const scanIdResult = await $`docker inspect --format={{.Id}} ${scanContainerName}`.quiet();
  const scanContainerId = scanIdResult.text().trim();

  try {
    await $`tar -C ${repoPath} -cf - . | docker exec -i ${scanContainerId} tar -xf - -C /workspace/`.quiet();

    const detectedVars = filterMissingEnvVars(await detectEnvVarsInContainer(
      scanContainerId,
      PROMPT_ENV_VAR_SCAN,
      "Analyze this project and return a JSON array of all environment variables it uses. Read .env.example, README, docker-compose.yml, and key source files. Return ONLY the JSON array.",
      verbose,
    ), env);
    if (detectedVars.length > 0 && process.stdin.isTTY) {
      const userEnvVars = await promptUserForEnvVars(detectedVars);
      return [...env, ...userEnvVars];
    }

    if (detectedVars.length > 0) {
      log(`Found ${detectedVars.length} env var(s) but stdin is not a TTY — skipping prompts.`);
      log("Pass env vars via -e flags: autoenv -e KEY=value ...");
    }

    return env;
  } finally {
    await $`docker rm -f ${scanContainerName}`.quiet().nothrow();
  }
}

async function detectTestingEnvVars(
  repoPath: string,
  baseImage: string,
  goal: string,
  env: string[],
  verbose: boolean,
): Promise<string[]> {
  log("Analyzing project for verification-specific environment variables...");
  const scanContainerName = `autoenv-test-envscan-${Date.now()}`;
  const scanRunArgs = [
    "run", "-d",
    "--name", scanContainerName,
    "--network", "bridge",
    baseImage,
    "tail", "-f", "/dev/null",
  ];
  await $`docker ${scanRunArgs}`.quiet();
  const scanIdResult = await $`docker inspect --format={{.Id}} ${scanContainerName}`.quiet();
  const scanContainerId = scanIdResult.text().trim();

  try {
    await $`tar -C ${repoPath} -cf - . | docker exec -i ${scanContainerId} tar -xf - -C /workspace/`.quiet();

    const detectedVars = filterMissingEnvVars(await detectEnvVarsInContainer(
      scanContainerId,
      buildTestingEnvVarScanPrompt(goal),
      `Analyze this project and return a JSON array containing only the minimal environment variables needed to verify this request: ${goal}`,
      verbose,
    ), env);
    if (detectedVars.length > 0 && process.stdin.isTTY) {
      const userEnvVars = await promptUserForEnvVars(detectedVars);
      return [...env, ...userEnvVars];
    }

    if (detectedVars.length > 0) {
      log(`Found ${detectedVars.length} verification-specific env var(s) but stdin is not a TTY — skipping prompts.`);
      log("Pass env vars via -e flags or rerun interactively with --test-mode prompt.");
    }

    return env;
  } finally {
    await $`docker rm -f ${scanContainerName}`.quiet().nothrow();
  }
}

function sanitizeTestingName(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "input";
}

function makeTestingOutputDir(repo: string, explicitOutput?: string): string {
  if (explicitOutput) {
    return explicitOutput;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve(process.cwd(), ".autoenv-test-results", `${sanitizeTestingName(repo)}-${stamp}`);
}

async function copyWorkspaceIntoContainer(repoPath: string, containerId: string): Promise<void> {
  await $`docker exec ${containerId} mkdir -p /workspace`.quiet();
  await $`tar -C ${repoPath} -cf - . | docker exec -i ${containerId} tar -xf - -C /workspace/`.quiet();
}

async function copyTestingInputsIntoContainer(paths: string[], containerId: string): Promise<string[]> {
  const copiedPaths: string[] = [];
  if (paths.length === 0) {
    return copiedPaths;
  }

  await $`docker exec ${containerId} mkdir -p /workspace/test-inputs`.quiet();

  for (const [index, hostPath] of paths.entries()) {
    const exists = await $`test -e ${hostPath}`.quiet().nothrow();
    if (exists.exitCode !== 0) {
      throw new Error(`Testing input path does not exist: ${hostPath}`);
    }

    const base = hostPath.split("/").filter(Boolean).pop() || "input";
    const name = sanitizeTestingName(`${String(index + 1).padStart(2, "0")}-${base}`);
    const parent = resolve(hostPath, "..");
    const extractedPath = `/workspace/test-inputs/${base}`;
    const destination = extractedPath === `/workspace/test-inputs/${name}`
      ? extractedPath
      : `/workspace/test-inputs/${name}`;

    await $`docker exec ${containerId} mkdir -p /workspace/test-inputs`.quiet();
    await $`tar -C ${parent} -cf - ${base} | docker exec -i ${containerId} tar -xf - -C /workspace/test-inputs/`.quiet();
    if (extractedPath !== destination) {
      await $`docker exec ${containerId} rm -rf ${destination}`.quiet().nothrow();
      await $`docker exec ${containerId} mv ${extractedPath} ${destination}`.quiet();
    }
    copiedPaths.push(destination);
  }

  return copiedPaths;
}

async function copyTestingArtifacts(containerId: string, outputDir: string): Promise<boolean> {
  await $`mkdir -p ${outputDir}`.quiet();
  const result = await $`docker cp ${containerId}:/workspace/.autoenv-testing/. ${outputDir}/`.quiet().nothrow();
  return result.exitCode === 0;
}

async function writeFallbackTestingArtifacts(
  outputDir: string,
  goal: string,
  repoLabel: string,
  extraPaths: string[],
  errorMessage: string,
): Promise<void> {
  await $`mkdir -p ${outputDir}`.quiet();

  const report: TestingReport = {
    status: "failed",
    request: goal,
    summary: errorMessage,
    artifacts: [],
    nextSteps: [
      "Inspect the repository and the extra inputs for missing setup steps.",
      "Re-run with explicit environment variables via -e if the project needs credentials.",
    ],
  };

  const reportMd = `# Testing Report

Status: failed

Request: ${goal}

Primary codebase: ${repoLabel}

Additional codebases: ${extraPaths.length > 0 ? extraPaths.join(", ") : "none"}

Summary:
${errorMessage}
`;

  const demoMd = `# Demo

No demo artifacts were produced because the testing run failed before a structured report was written.
`;

  await Bun.write(join(outputDir, "report.json"), JSON.stringify(report, null, 2));
  await Bun.write(join(outputDir, "report.md"), reportMd);
  await Bun.write(join(outputDir, "demo.md"), demoMd);
}

function createDockerOperations(containerId: string) {
  const dockerExec = (args: string[]): string[] => ["docker", "exec", containerId, ...args];
  const dockerExecW = (cwd: string, args: string[]): string[] => ["docker", "exec", "-w", cwd, containerId, ...args];

  const bash: BashOperations = {
    exec: async (command, cwd, { onData, signal, timeout }) => {
      const args = ["docker", "exec", "-w", cwd, containerId, "bash", "-c", command];
      const proc = Bun.spawn(args, {
        stdout: "pipe",
        stderr: "pipe",
        stdin: "ignore",
      });

      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      if (timeout) {
        timeoutId = setTimeout(() => proc.kill(), timeout);
      }
      if (signal) {
        signal.addEventListener("abort", () => proc.kill(), { once: true });
      }

      if (proc.stdout) {
        const reader = proc.stdout.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            onData(Buffer.from(value));
          }
        } catch {}
      }
      if (proc.stderr) {
        const reader = proc.stderr.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            onData(Buffer.from(value));
          }
        } catch {}
      }

      const exitCode = await proc.exited;
      if (timeoutId) clearTimeout(timeoutId);
      return { exitCode };
    },
  };

  const read: ReadOperations = {
    readFile: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["cat", absolutePath]), {
        stdout: "pipe", stderr: "pipe", stdin: "ignore",
      });
      const output = await new Response(proc.stdout).arrayBuffer();
      const exitCode = await proc.exited;
      if (exitCode !== 0) throw new Error(`Failed to read ${absolutePath} in container`);
      return Buffer.from(output);
    },
    access: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["test", "-r", absolutePath]), {
        stdout: "ignore", stderr: "ignore", stdin: "ignore",
      });
      const exitCode = await proc.exited;
      if (exitCode !== 0) throw new Error(`File not accessible: ${absolutePath}`);
    },
    detectImageMimeType: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["file", "--mime-type", "-b", absolutePath]), {
        stdout: "pipe", stderr: "ignore", stdin: "ignore",
      });
      const output = (await new Response(proc.stdout).text()).trim();
      const exitCode = await proc.exited;
      if (exitCode !== 0) return null;
      return output.startsWith("image/") ? output : null;
    },
  };

  const write: WriteOperations = {
    writeFile: async (absolutePath, content) => {
      const proc = Bun.spawn(["docker", "exec", "-i", containerId, "tee", absolutePath], {
        stdout: "ignore", stderr: "pipe", stdin: "pipe",
      });
      (proc.stdin as any).write(new TextEncoder().encode(content));
      (proc.stdin as any).end();
      const exitCode = await proc.exited;
      if (exitCode !== 0) throw new Error(`Failed to write ${absolutePath} in container`);
    },
    mkdir: async (dir) => {
      const proc = Bun.spawn(dockerExec(["mkdir", "-p", dir]), {
        stdout: "ignore", stderr: "ignore", stdin: "ignore",
      });
      await proc.exited;
    },
  };

  const edit: EditOperations = {
    readFile: read.readFile,
    writeFile: write.writeFile,
    access: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["test", "-r", absolutePath, "-a", "-w", absolutePath]), {
        stdout: "ignore", stderr: "ignore", stdin: "ignore",
      });
      const exitCode = await proc.exited;
      if (exitCode !== 0) throw new Error(`File not accessible for editing: ${absolutePath}`);
    },
  };

  const grep: GrepOperations = {
    isDirectory: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["test", "-d", absolutePath]), {
        stdout: "ignore", stderr: "ignore", stdin: "ignore",
      });
      return (await proc.exited) === 0;
    },
    readFile: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["cat", absolutePath]), {
        stdout: "pipe", stderr: "ignore", stdin: "ignore",
      });
      const output = await new Response(proc.stdout).text();
      const exitCode = await proc.exited;
      if (exitCode !== 0) throw new Error(`Failed to read ${absolutePath}`);
      return output;
    },
  };

  const find: FindOperations = {
    exists: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["test", "-e", absolutePath]), {
        stdout: "ignore", stderr: "ignore", stdin: "ignore",
      });
      return (await proc.exited) === 0;
    },
    glob: async (pattern, cwd, opts) => {
      const findArgs = ["find", cwd, "-maxdepth", "10", "-name", pattern];
      if (opts.limit > 0) {
        findArgs.push("|", "head", "-n", String(opts.limit));
      }
      const cmd = findArgs.join(" ");
      const proc = Bun.spawn(dockerExecW(cwd, ["bash", "-c", cmd]), {
        stdout: "pipe", stderr: "ignore", stdin: "ignore",
      });
      const output = (await new Response(proc.stdout).text()).trim();
      await proc.exited;
      if (!output) return [];
      return output.split("\n").filter(Boolean);
    },
  };

  const ls: LsOperations = {
    exists: find.exists,
    stat: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["test", "-d", absolutePath]), {
        stdout: "ignore", stderr: "ignore", stdin: "ignore",
      });
      const isDir = (await proc.exited) === 0;
      return { isDirectory: () => isDir };
    },
    readdir: async (absolutePath) => {
      const proc = Bun.spawn(dockerExec(["ls", "-1", absolutePath]), {
        stdout: "pipe", stderr: "ignore", stdin: "ignore",
      });
      const output = (await new Response(proc.stdout).text()).trim();
      await proc.exited;
      if (!output) return [];
      return output.split("\n").filter(Boolean);
    },
  };

  return { bash, read, write, edit, grep, find, ls };
}

async function createDockerTools(containerId: string) {
  const ops = createDockerOperations(containerId);
  const {
    createBashTool,
    createReadTool,
    createWriteTool,
    createEditTool,
    createGrepTool,
    createFindTool,
    createLsTool,
  } = await getPiCodingAgentModule();
  return [
    createBashTool("/workspace", { operations: ops.bash }),
    createReadTool("/workspace", { operations: ops.read }),
    createWriteTool("/workspace", { operations: ops.write }),
    createEditTool("/workspace", { operations: ops.edit }),
    createGrepTool("/workspace", { operations: ops.grep }),
    createFindTool("/workspace", { operations: ops.find }),
    createLsTool("/workspace", { operations: ops.ls }),
  ];
}

async function ensureDynamicSetupBaseImage(verbose: boolean): Promise<string> {
  const imageName = "autoenv-dynamic-setup-base";
  const result = await $`docker images -q ${imageName}`.quiet().nothrow();
  if (result.text().trim().length > 0) {
    if (verbose) log("Using cached base image for dynamic setup.");
    return imageName;
  }

  log("Building base image for dynamic setup...");

  const dockerfile = `FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \\
    curl git build-essential python3 python3-pip wget unzip docker.io \\
    ca-certificates gnupg ripgrep fd-find \\
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \\
    && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:\${PATH}"
WORKDIR /workspace
`;

  const tmpDir = join(homedir(), ".autoenv", "tmp-dynamic-base");
  await $`mkdir -p ${tmpDir}`.quiet();
  await Bun.write(join(tmpDir, "Dockerfile"), dockerfile);

  try {
    if (verbose) {
      await $`docker build -t ${imageName} ${tmpDir}`;
    } else {
      await $`docker build -t ${imageName} ${tmpDir}`.quiet();
    }
  } finally {
    await $`rm -rf ${tmpDir}`.quiet().nothrow();
  }

  logStep("Base image built.");
  return imageName;
}

async function dynamicSetupEnvironment(
  repoPath: string,
  imageName: string,
  opts: DynamicSetupOptions,
  env: string[],
  verbose: boolean,
): Promise<void> {
  await ensureAgentApiKey();

  const baseImage = opts.baseImage || await ensureDynamicSetupBaseImage(verbose);

  env = await detectAndPromptEnvVars(repoPath, baseImage, env, verbose);

  const containerName = `autoenv-setup-${Date.now()}`;
  const runArgs = ["run", "-d", "--name", containerName, "--network", "bridge"];

  for (const e of env) {
    runArgs.push("-e", e);
  }

  runArgs.push(baseImage, "tail", "-f", "/dev/null");

  log("Starting setup container...");
  await $`docker ${runArgs}`.quiet();

  const idResult = await $`docker inspect --format={{.Id}} ${containerName}`.quiet();
  const containerId = idResult.text().trim();

  try {
    logStep("Copying repository into container...");
    await $`tar -C ${repoPath} -cf - . | docker exec -i ${containerId} tar -xf - -C /workspace/`.quiet();

    const dockerTools = await createDockerTools(containerId);

    logStep("Starting AI agent for environment setup...");
    const model = getModel("anthropic", "claude-sonnet-4-5-20250929");

    const agent = new Agent({
      initialState: {
        systemPrompt: PROMPT_DYNAMIC_SETUP,
        model,
        thinkingLevel: "medium",
        tools: dockerTools,
      },
      getApiKey: getAgentApiKey,
    });

    subscribeAgentProgress(agent, verbose, "setup");

    const timeout = opts.timeout || 600000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      log("Setup timeout reached, aborting...");
      agent.abort();
      controller.abort();
    }, timeout);

    try {
      await agent.prompt("Set up this project environment.");
    } finally {
      clearTimeout(timeoutId);
    }

    if (agent.state.error) {
      throw new Error(`Agent setup failed: ${agent.state.error}`);
    }

    const entrypointCheck = await $`docker exec ${containerId} test -f /workspace/.autoenv-entrypoint.sh`.quiet().nothrow();
    if (entrypointCheck.exitCode !== 0) {
      console.error("[autoenv] Warning: Agent did not create .autoenv-entrypoint.sh. Image will have no ENTRYPOINT.");
    }

    logStep("Committing container to image...");
    const commitArgs = ["commit"];
    if (entrypointCheck.exitCode === 0) {
      commitArgs.push(
        "--change", 'ENTRYPOINT ["/workspace/.autoenv-entrypoint.sh"]',
      );
    }
    commitArgs.push(
      "--change", "WORKDIR /workspace",
      containerId,
      imageName,
    );
    await $`docker ${commitArgs}`.quiet();
    logStep(`Image committed: ${imageName}`);

  } finally {
    log("Cleaning up setup container...");
    await $`docker rm -f ${containerName}`.quiet().nothrow();
  }

  log("Dynamic setup complete.");
}

interface TestingRunResult {
  outputDir: string;
  status: string;
  summary: string;
  exitCode: number;
}

async function runTestingMode(
  repoPath: string,
  repoLabel: string,
  testingOpts: TestingOptions,
  setupOpts: DynamicSetupOptions,
  env: string[],
  verbose: boolean,
): Promise<TestingRunResult> {
  if (!testingOpts.goal) {
    throw new Error("Missing testing request. Use --test \"<goal>\".");
  }

  await ensureAgentApiKey();

  const baseImage = setupOpts.baseImage || await ensureDynamicSetupBaseImage(verbose);
  const resolvedEnv = testingOpts.envPolicy === "prompt"
    ? await detectTestingEnvVars(repoPath, baseImage, testingOpts.goal, env, verbose)
    : env;
  const outputDir = makeTestingOutputDir(repoLabel, testingOpts.output);
  const containerName = `autoenv-test-${Date.now()}`;
  const runArgs = ["run", "-d", "--name", containerName, "--network", "bridge"];

  for (const e of resolvedEnv) {
    runArgs.push("-e", e);
  }

  runArgs.push("-v", "/var/run/docker.sock:/var/run/docker.sock");
  runArgs.push(baseImage, "tail", "-f", "/dev/null");

  log("Starting testing container...");
  await $`docker ${runArgs}`.quiet();

  const idResult = await $`docker inspect --format={{.Id}} ${containerName}`.quiet();
  const containerId = idResult.text().trim();

  let agentError = "";
  let copiedArtifacts = false;
  let timedOut = false;

  try {
    logStep("Copying primary repository into test container...");
    await copyWorkspaceIntoContainer(repoPath, containerId);

    if (testingOpts.paths.length > 0) {
      logStep(`Copying ${testingOpts.paths.length} extra codebase(s) into test container...`);
    }
    const copiedPaths = await copyTestingInputsIntoContainer(testingOpts.paths, containerId);

    await $`docker exec ${containerId} mkdir -p /workspace/.autoenv-testing/artifacts`.quiet();

    const dockerTools = await createDockerTools(containerId);
    const model = getModel("anthropic", "claude-sonnet-4-5-20250929");

    logStep("Starting AI agent for autonomous testing...");
    const agent = new Agent({
      initialState: {
        systemPrompt: buildTestingModeSystemPrompt(testingOpts.envPolicy),
        model,
        thinkingLevel: "medium",
        tools: dockerTools,
      },
      getApiKey: getAgentApiKey,
    });

    subscribeAgentProgress(agent, verbose, "test");

    const timeout = testingOpts.timeout || 1200000;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      agent.abort();
    }, timeout);

    const extraPathsSection = copiedPaths.length > 0
      ? copiedPaths.map((path, index) => `- extra[${index + 1}]: ${path}`).join("\n")
      : "- none";

    const testingPrompt = `Testing request:
${testingOpts.goal}

Primary codebase:
- /workspace

Additional local codebases:
${extraPathsSection}

Testing env policy:
- ${testingOpts.envPolicy}

Environment variables already injected into the container:
${resolvedEnv.length > 0 ? resolvedEnv.map((value) => `- ${value.split("=")[0]}`).join("\n") : "- none"}

Deliver the final verdict in /workspace/.autoenv-testing/report.json and /workspace/.autoenv-testing/report.md.`;

    try {
      await agent.prompt(testingPrompt);
    } catch (err: any) {
      agentError = err.message || String(err);
    } finally {
      clearTimeout(timeoutId);
    }

    if (agent.state.error) {
      agentError = agent.state.error;
    }
    if (timedOut && !agentError) {
      agentError = `Testing agent timed out after ${Math.round(timeout / 1000)} seconds.`;
    }

    copiedArtifacts = await copyTestingArtifacts(containerId, outputDir);
  } finally {
    log("Cleaning up testing container...");
    await $`docker rm -f ${containerName}`.quiet().nothrow();
  }

  const reportJsonPath = join(outputDir, "report.json");
  const reportMdPath = join(outputDir, "report.md");
  const demoMdPath = join(outputDir, "demo.md");

  if (!copiedArtifacts || !await Bun.file(reportJsonPath).exists()) {
    const errorMessage = agentError || "Testing run did not produce a structured report.";
    await writeFallbackTestingArtifacts(outputDir, testingOpts.goal, repoLabel, testingOpts.paths, errorMessage);
  } else {
    if (!await Bun.file(reportMdPath).exists()) {
      const reportText = await Bun.file(reportJsonPath).text();
      await Bun.write(reportMdPath, `# Testing Report\n\nStructured report only:\n\n\`\`\`json\n${reportText}\n\`\`\`\n`);
    }
    if (!await Bun.file(demoMdPath).exists()) {
      await Bun.write(demoMdPath, "# Demo\n\nNo separate demo artifact was generated.\n");
    }
  }

  let status = agentError ? "failed" : "inconclusive";
  let summary = agentError || `Testing artifacts written to ${outputDir}`;

  try {
    const parsed: TestingReport = await Bun.file(reportJsonPath).json();
    if (parsed.status) {
      status = parsed.status;
    }
    if (parsed.summary) {
      summary = parsed.summary;
    }
  } catch {}

  if (agentError && status === "passed") {
    status = "failed";
  }

  return {
    outputDir,
    status,
    summary,
    exitCode: status === "passed" ? 0 : 1,
  };
}

async function runSetupCommand(parsed: SetupCommandParsed): Promise<void> {
  const { repoUrl, containerArgs, sandbox, dynamicSetup, verbose, force, rebuild, tag } = parsed;
  let owner: string;
  let repo: string;
  let repoPath: string;

  if (isLocalPath(repoUrl)) {
    repoPath = resolve(repoUrl);
    repo = repoPath.split("/").pop() || "local-app";
    owner = "local";
    log(`Using local path: ${repoPath}`);
  } else {
    const p = parseRepoUrl(repoUrl);
    owner = p.owner;
    repo = p.repo;
    repoPath = await cloneOrCache(repoUrl, force, verbose, tag);
  }

  const imageName = getImageName(owner, repo);
  if (!await imageExists(imageName) || force || rebuild) {
    await dynamicSetupEnvironment(repoPath, imageName, dynamicSetup, sandbox.env, verbose);
  } else {
    log("Using cached setup image.");
  }

  if (containerArgs.length === 0) {
    log(`Image ready: ${imageName}`);
    log("Launching interactive shell...");
    const shellArgs = ["run", "--rm", "-it", "--network", sandbox.network];
    for (const e of sandbox.env) shellArgs.push("-e", e);
    for (const m of sandbox.mounts) shellArgs.push("-v", m);
    if (sandbox.port) shellArgs.push("-p", `${sandbox.port}:${sandbox.port}`);
    shellArgs.push("--entrypoint", "bash", imageName);
    const proc = Bun.spawn(["docker", ...shellArgs], {
      stdin: "inherit", stdout: "inherit", stderr: "inherit",
    });
    process.exit(await proc.exited);
  }

  const dockerArgs = buildDockerArgs(sandbox, imageName, containerArgs);
  if (verbose) {
    log(`Running: docker ${dockerArgs.join(" ")}`);
  }
  const proc = Bun.spawn(["docker", ...dockerArgs], {
    stdin: "inherit", stdout: "inherit", stderr: "inherit",
  });
  process.exit(await proc.exited);
}

async function runTestCommand(parsed: TestCommandParsed): Promise<void> {
  const { repoUrl, sandbox, testing, setupForTest, verbose, force, tag } = parsed;
  let owner: string;
  let repo: string;
  let repoPath: string;

  if (isLocalPath(repoUrl)) {
    repoPath = resolve(repoUrl);
    repo = repoPath.split("/").pop() || "local-app";
    owner = "local";
    log(`Using local path: ${repoPath}`);
  } else {
    const p = parseRepoUrl(repoUrl);
    owner = p.owner;
    repo = p.repo;
    repoPath = await cloneOrCache(repoUrl, force, verbose, tag);
  }

  const result = await runTestingMode(
    repoPath,
    `${owner}/${repo}`,
    testing,
    setupForTest,
    sandbox.env,
    verbose,
  );

  console.log(`\nTesting finished: ${result.status}`);
  console.log(`  Report: ${join(result.outputDir, "report.md")}`);
  console.log(`  Demo:   ${join(result.outputDir, "demo.md")}`);
  console.log(`  Output: ${result.outputDir}`);
  if (result.summary) {
    console.log(`  Summary: ${result.summary}`);
  }
  process.exit(result.exitCode);
}

async function main() {
  const argv = await maybePromptForTopLevelInvocation(process.argv.slice(2));

  if (argv.length === 0) {
    console.error("Error: missing command. Use: autoenv setup | autoenv test | autoenv help");
    console.log(getRootHelpText());
    process.exit(1);
  }

  if (argv[0] === "-h" || argv[0] === "--help") {
    console.log(getRootHelpText());
    process.exit(0);
  }

  const sub = argv[0];
  if (sub === "help") {
    if (argv[1] === "setup") {
      console.log(getSetupHelpText());
    } else if (argv[1] === "test") {
      console.log(getTestHelpText());
    } else {
      console.log(getRootHelpText());
    }
    process.exit(0);
  }

  try {
    if (sub === "setup") {
      await runSetupCommand(await resolveSetupArgsWithPrompts(argv.slice(1)));
      return;
    }
    if (sub === "test") {
      await runTestCommand(await resolveTestArgsWithPrompts(argv.slice(1)));
      return;
    }
    console.error(`Unknown command: ${sub}`);
    console.log(getRootHelpText());
    process.exit(1);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "__HELP__") {
      if (sub === "setup") {
        console.log(getSetupHelpText());
      } else if (sub === "test") {
        console.log(getTestHelpText());
      } else {
        console.log(getRootHelpText());
      }
      process.exit(0);
    }
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(`Error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  });
}
