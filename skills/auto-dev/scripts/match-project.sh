#!/bin/bash
# Match project experience files against user input
# Usage: match-project.sh "user input or project name"
# Output: matching project experience content, silent if no match

DIR="$(dirname "$0")/../references/project-patterns"
[ ! -d "$DIR" ] && exit 0
[ -z "$1" ] && exit 0

for f in "$DIR"/*.md; do
  [ ! -f "$f" ] && continue
  project=$(basename "$f" .md)
  # Extract aliases from YAML frontmatter
  aliases=$(grep '^aliases:' "$f" | sed 's/^aliases: *//;s/\[//g;s/\]//g;s/, */|/g;s/ *$//')
  patterns="$project"
  [ -n "$aliases" ] && patterns="$patterns|$aliases"
  if echo "$1" | grep -qiE "$patterns"; then
    echo "--- project experience: $project ---"
    awk 'BEGIN{n=0} /^---$/{n++;next} n>=2{print}' "$f"
    echo ""
  fi
done
