#!/bin/bash

cd user
npm run dev &

cd ../sequencer
npm run start &

wait
