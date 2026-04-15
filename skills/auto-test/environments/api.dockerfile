# Auto-Test Environment: REST/GraphQL API [Stable]
#
# Provides: HTTP client tools for API interaction
# Capabilities: HTTP requests, response inspection, auth flows, timing
# Capability tier: Stable
#
# Usage: The agent builds the API server into this image and tests it
# using curl/httpie from within the same container or a sidecar.

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    jq \
    httpie \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Project-specific layers go below this line.
# The agent should:
# 1. Change the base image if the API needs a specific runtime
# 2. COPY project files
# 3. RUN install/build steps
# 4. EXPOSE the API port
# 5. CMD to start the API server
