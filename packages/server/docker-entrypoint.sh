#!/bin/sh
set -e

node dist/database/setup.js
exec node dist/index.js
