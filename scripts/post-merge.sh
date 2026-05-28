#!/bin/bash
set -e

if [ -f requirements.txt ]; then
  uv pip install -r requirements.txt
fi
