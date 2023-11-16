#!/bin/bash

cd user
npm run dev &
nvm use v20.5.0 &

cd ../sequencer
npm run start &
nvm use v20.5.0 &

cd ../L2
npm run start &
nvm use v20.5.0 &

wait
