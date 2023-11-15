#!/bin/bash

cd user
npm run dev &

cd ../sequencer
npm run start &

cd ../L2
npm run start &

wait
