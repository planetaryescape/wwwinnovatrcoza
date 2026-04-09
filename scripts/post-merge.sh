#!/bin/bash
set -e
npm install
npm run db:push
npm install --prefix artifacts/innovatr-home-mockup
