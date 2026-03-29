#!/bin/bash
# Free port 3000 and start dev server
echo "Freeing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Port 3000 freed." || echo "Port 3000 was already free or could not be freed."
sleep 2
echo "Starting dev server on port 3000..."
cd "$(dirname "$0")" && npm run dev
