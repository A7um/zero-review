# Auto-Test Environment: Desktop Application [Experimental]
#
# Provides: Virtual display, input simulation, accessibility framework, screenshot tools
# Capabilities: Window interaction, keyboard/mouse simulation, a11y tree, screenshots
# Capability tier: Experimental — requires vision-capable model (GPT-5.4+ recommended)
#
# Known limitations:
# - Native GTK/Qt apps may not expose full accessibility trees
# - xdotool coordinate-based clicking is fragile across resolutions
# - Modal dialogs and focus management are common failure points
# - Complex multi-window flows are unreliable
#
# Usage: The agent installs the desktop application and its dependencies,
# then interacts through xdotool + AT-SPI + screenshots.

FROM ubuntu:24.04

RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    xdotool \
    at-spi2-core \
    dbus-x11 \
    imagemagick \
    scrot \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV DISPLAY=:99

COPY <<'EOF' /usr/local/bin/start-display.sh
#!/bin/bash
dbus-launch --exit-with-session &
Xvfb :99 -screen 0 1280x720x24 -nolisten tcp &
sleep 2
EOF
RUN chmod +x /usr/local/bin/start-display.sh

WORKDIR /app

# Project-specific layers go below this line.
# The agent should:
# 1. Install the application and its dependencies (apt, snap, flatpak, or from source)
# 2. Set up any required configuration
# 3. CMD to start the application
