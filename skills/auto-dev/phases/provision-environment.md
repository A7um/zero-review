---
id: provision-environment
name: Provision Environment
inputs: [TestPlan or diagnosis doc, project source]
outputs: [Environment access block]
optional: true
---

# Phase: Provision Environment

## Purpose
Auto-provision a Docker environment so the agent can run E2E tests against a real, running instance of the software. This phase produces an Environment block in the same format as a user-provided environment — downstream phases don't care how the environment was created.

**This phase is only invoked when:**
- The user has no environment to provide but wants real E2E verification
- The agent asks "want me to set one up?" and the user agrees

If the user already provided an environment (docker exec, SSH, local shell, etc.), skip this phase entirely.

## Process

1. **Analyze project requirements:**
   - Read TestPlan (or diagnosis doc) for ports, services, and dependencies
   - Identify base image — use `config/defaults.json → environment.default_image` unless the project requires something specific
   - Identify companion services needed (e.g., postgres, redis)

2. **Start containers:**
   - Container name: `{container_prefix}-{slug}` (from config, e.g., `e2e-my-app`)
   - Service containers (if needed): `{container_prefix}-{slug}-{service}` (e.g., `e2e-my-app-postgres`)
   - Volume mount: `{output_root}/implementations/{slug}:/app`
   - Network: create a shared network `{container_prefix}-{slug}-net` if multiple containers
   - Example:
     ```bash
     docker network create e2e-my-app-net
     docker run -d --name e2e-my-app-postgres --network e2e-my-app-net postgres:16
     docker run -d --name e2e-my-app --network e2e-my-app-net \
       -v /path/to/implementations/my-app:/app \
       -w /app -p 3000:3000 node:20-bookworm tail -f /dev/null
     ```

3. **Run setup commands inside the app container:**
   ```bash
   docker exec e2e-my-app sh -c "cd /app && npm install && npm run build && npm start &"
   ```
   Adapt to the project's stack (pip install, cargo build, etc.)

4. **Health check with retry loop:**
   - Up to 10 retries, 3-second intervals (respect `config/defaults.json → environment.timeout_seconds` as overall cap)
   - Health check should target the app's main entry point (e.g., `curl -f http://localhost:3000/health`)
   - If health check never passes → log the failure, skip E2E, report to user

5. **Output the Environment block:**
   Record in the TestPlan's Environment Spec section:
   ```
   Environment:
     type: docker
     exec: docker exec -i e2e-my-app
     workdir: /app
     ports: 3000
     auto_provisioned: true
   ```

## Teardown

Teardown runs **after all verification completes** (called from the verify phase, not here). It is documented here for reference:

```bash
docker stop e2e-my-app e2e-my-app-postgres 2>/dev/null
docker rm e2e-my-app e2e-my-app-postgres 2>/dev/null
docker network rm e2e-my-app-net 2>/dev/null
```

- **Always** tear down, even on failure (`config/defaults.json → environment.cleanup: "always"`)
- Verify phase is responsible for calling teardown at the right time

## Principles

- `principles/strategic-design.md` — Environment provisioning is an investment in verification quality
- `principles/error-handling.md` — Health check failures are clearly reported, not silently swallowed

## Outputs
- Running container(s) accessible via exec command
- Environment block written to TestPlan's Environment Spec section

## Quality Gate
- All containers running (check `docker ps`)
- Health check passed within timeout
- Environment block produced with `type`, `exec`, `workdir`, and `ports`

## Skip Conditions
- User already provided an environment → skip (use theirs)
- No E2E tests in TestPlan → skip (nothing to run in the environment)
- Docker not available on the machine → skip, inform user
