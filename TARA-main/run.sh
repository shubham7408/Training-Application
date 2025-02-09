#!/bin/bash

cd /home/ubuntu/temp/toloka/backend
nohup npm run dev &

cd /home/ubuntu/temp/toloka/frontend
nohup npm run dev &

if [ "$1" == "--kill" ]; then
    # Execute the logic when --kill is provided
    echo "Killing the process..."
    kill -9 3000 5173 5174
    pkill node || pkill npm
else
    # Execute the default logic
    cd /home/ubuntu/temp/toloka/backend
    nohup npm run dev &

    cd /home/ubuntu/temp/toloka/frontend
    nohup npm run dev &
fi
