#!/usr/bin/env node

const program = require('commander');
const sox = require('./sox');
const fs = require('fs');
const path = require('path');

program
  .version('0.0.0');

const files = fs.readdirSync('./');
for (let i = 0; i < files.length; i++) {
  const filename = path.join('./', files[i]);
  if (path.extname(filename) === '.flac') {
    sox.transcode(filename);
  }
}

console.log('Finished!');
