#!/bin/bash
set -e
npm install
npm run db:push
if [ -f artifacts/innovatr-home-mockup/package.json ]; then
  npm install --prefix artifacts/innovatr-home-mockup
fi
