#!/bin/bash
# Information steps:
# 1) chmod u+x git-pull.sh
# 2) ./git-pull.sh

remote_path="YOUR_REMOTE_PATH"
branch="master"

echo "--> Pull"
cd ..
pwd
git pull $remote_path $branch
