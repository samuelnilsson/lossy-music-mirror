#!/usr/bin/env node

/**
 * The starting script of the program.
 */

import * as app from './app';
import * as commandLineInputParser from './commandLineInputParser';
import { CommandLineOptions } from './models/CommandLineOptions';

const options: CommandLineOptions = commandLineInputParser.parse({
  version: '0.1.1',
  addHelp: true
});

app.run(options)
  .then(() => {
    process.exit();
  })
  .catch((err: Error) => {
    throw(err);
  });
