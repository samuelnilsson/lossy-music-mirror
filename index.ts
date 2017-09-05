/**
 * The starting script of the program.
 */

import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as sox from './sox';

program
  .version('0.0.0')
  .usage('<output-directory>')
  .parse(process.argv);

const outputDirectory: string = program.args[0];

const files: string[] = fs.readdirSync('./');
for (const file of files) {
  const filename: string = path.join('./', file);
  if (path.extname(filename) === '.flac') {
    sox.transcode(filename, outputDirectory);
  }
}
