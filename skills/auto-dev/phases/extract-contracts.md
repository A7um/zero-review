---
id: extract-contracts
name: Extract Contracts
inputs: [architecture doc]
outputs: [interface stubs per submodule]
optional: true
---

# Phase: Extract Contracts

## Purpose
Extract interface stubs from the architecture doc so parallel implementation sessions can build against stable contracts.

## Process

1. **Read the architecture doc**
2. **For each submodule**, identify what it exposes to other submodules
3. **Write interface stubs** — signatures only, no bodies
4. **For types/schemas shared by 2+ submodules**, put them in `contracts/shared.{ext}`

**Where contracts live:**
```
{output_root}/contracts/{module_name}.{ext}
```

**Example (TypeScript):**
```typescript
// contracts/report-generator.ts
export interface ReportGenerator {
  generate(data: ReportData, options: RenderOptions): Promise<ReportResult>;
}

export interface ReportResult {
  filePath: string;
  pageCount: number;
  errors: string[];
}
```

**For XL designs:** Delegate contract extraction to a separate session before spawning implementation sessions. Pass it the architecture doc and ask it to write only the contracts folder.

## Principles

- `principles/module-depth.md` — Interfaces should be simple, implementations complex
- `principles/information-hiding.md` — Contracts define what is exposed; everything else is hidden
- `principles/abstraction-layers.md` — Each contract should provide a distinct abstraction

## Outputs
- `{output_root}/contracts/{module_name}.{ext}` per submodule
- `{output_root}/contracts/shared.{ext}` for shared types

## Quality Gate
- Every submodule in the architecture doc has a corresponding contract
- Contracts contain only signatures and types, no implementations
- Shared types are in a single shared contract file

## Skip Conditions
- S complexity tasks with a single submodule
- Tasks where parallel implementation is not needed
