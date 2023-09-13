#!/bin/bash
cd api
npm install
node index.js &
cd ..
npm install
node app.js 