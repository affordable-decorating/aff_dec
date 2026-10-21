#!/bin/bash
# Starts a local web server for this site and opens it in your browser.
# macOS: double-click this file. Linux: run ./start-local-server.command in a terminal.
# Press Ctrl+C (or close the window) to stop the server.
cd "$(dirname "$0")" || exit 1
PORT=8000
URL="http://localhost:$PORT/"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 was not found on this computer."
  echo "Install it from https://www.python.org/downloads/ and run this file again."
  read -n 1 -s -r -p "Press any key to close."
  exit 1
fi

( sleep 1
  if command -v open >/dev/null 2>&1; then open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
  else echo "Open $URL in your browser."; fi ) &

python3 -m http.server "$PORT"
