#!/bin/bash

cd user
npm i &
npm run dev &
nvm use v20.5.0 &

cd ../sequencer
npm i &
npm run start &
nvm use v20.5.0 &

cd ../L2
npm i &
npm run start &
nvm use v20.5.0 &

wait
