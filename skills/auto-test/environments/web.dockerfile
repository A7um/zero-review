# Auto-Test Environment: Web Application [Stable]
#
# Provides: Chromium browser, Playwright, virtual display (Xvfb)
# Capabilities: DOM interaction, accessibility tree, screenshots, console/network capture
# Capability tier: Stable (DOM/a11y), Experimental (visual validation)
#
# Usage: The agent builds a project-specific image layered on top of this base,
# adding the application's own build steps and dependencies.

FROM mcr.microsoft.com/playwright:v1.52.0-noble

RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

ENV DISPLAY=:99

COPY <<'EOF' /usr/local/bin/start-display.sh
#!/bin/bash
Xvfb :99 -screen 0 1280x720x24 -nolisten tcp &
sleep 1
EOF
RUN chmod +x /usr/local/bin/start-display.sh

WORKDIR /app

# Project-specific layers go below this line.
# The agent appends: COPY, RUN (install deps), RUN (build), CMD (start app).
