#!/bin/bash

set -x

function SendMessageToHangoutsChat ()
{
    MESSAGE="$1";
    local FAILED=false;
    curl -s \
        -X POST \
        -H 'Content-Type: application/json' \
        "https://chat.googleapis.com/v1/spaces/AAAAoDUMWmc/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=bCzF4-KAWWwN-Y4khVpp55cQvVMGLOrc6wGpp48p9PM%3D" \
        -d "{\"text\": \"$MESSAGE\"}" || FAILED=true;
    if [ $FAILED = true ]; then
        echo "Failed to send message to Hangouts Chat"; return 1;
    fi
    return 0;
}
