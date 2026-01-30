#!/bin/bash

REPO_DIR="/root/box-manager-core/box-manager-core"
SERVICE_NAME="box-manager-core.service"

cd "$REPO_DIR" || exit 1

OLD_HEAD=$(git rev-parse HEAD)

git pull

NEW_HEAD=$(git rev-parse HEAD)

if [ "$OLD_HEAD" = "$NEW_HEAD" ]; then
    exit 0
fi

systemctl stop "$SERVICE_NAME"
./build.sh
systemctl start "$SERVICE_NAME"
