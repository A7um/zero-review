# Auto-Test Environment: CLI Tool [Stable]
#
# Provides: Minimal runtime for executing command-line tools
# Capabilities: Command execution, stdin/stdout/stderr capture, exit code checking
# Capability tier: Stable
#
# Usage: The agent selects an appropriate base image for the tool's language runtime
# and layers the tool's installation on top.

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Project-specific layers go below this line.
# The agent should:
# 1. Change the base image if needed (e.g., node:20, python:3.12, golang:1.22)
# 2. COPY project files
# 3. RUN install/build steps
# 4. Set ENTRYPOINT or leave interactive for shell-based testing
