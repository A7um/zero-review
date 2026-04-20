# Vendored Autoenv Runtime

This directory vendors the `autoenv` CLI runtime that powers `zero-review`'s sandboxed E2E testing skill.

The intended entrypoint from the plugin is:

```bash
../../scripts/run-e2e.sh --repo . --goal "Verify the feature works"
```

Direct runtime usage is still possible:

```bash
bun cli.ts test --test-mode mock . "Verify the feature works"
```

## What Is Included

- `cli.ts`
- `cli-parse.ts`
- `cli-prompts.ts`
- `package.json`

This runtime is intentionally vendored instead of referenced externally so the plugin can carry its own end-to-end testing implementation.
