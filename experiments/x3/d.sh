#!/bin/bash

update () {
    node p.js | node d.js 35
}

# Update the display once every 'n' seconds
while true; do update; sleep 10; done;
