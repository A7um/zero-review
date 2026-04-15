# Health Check Protocol

After provisioning the environment, verify the artifact is running and reachable before starting the perception-action loop.

## By Project Type

### Web Application

1. Wait for the container to report healthy (if Docker healthcheck is defined)
2. Send HTTP GET to the primary entrypoint URL
3. Expect: HTTP 200 (or 3xx redirect to a login/landing page)
4. Verify: response body is non-empty and contains expected content (HTML, not an error page)
5. Timeout: 60 seconds, with retries every 5 seconds

### CLI Tool

1. Run `<tool> --help` or `<tool> --version`
2. Expect: exit code 0 and non-empty stdout
3. Timeout: 15 seconds

### REST/GraphQL API

1. Send HTTP GET to the health endpoint (try `/health`, `/healthz`, `/api/health`, root `/`)
2. Expect: HTTP 200 with a response body
3. If no health endpoint is known, send a request to the primary API endpoint and accept any non-5xx response
4. Timeout: 60 seconds, with retries every 5 seconds

### Desktop Application (Experimental)

1. Launch the application
2. Wait for a window to appear (`xdotool search --name`)
3. Take an initial screenshot to confirm rendering
4. Timeout: 90 seconds (desktop apps can have slow startup)

## Failure Handling

If the health check fails after all retries:

1. Capture all available diagnostic output (container logs, stderr, exit codes)
2. File a blocking issue: "Artifact failed to start" with the diagnostic output
3. Skip the exploration phase — there's nothing to test
4. Proceed directly to teardown

Do not attempt to debug or fix the artifact. That's a dev agent's job.
