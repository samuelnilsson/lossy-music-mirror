/**
 * Tests for the CommandLineInputParser class
 */

import * as a from 'argparse';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { CommandLineInputParser } from './CommandLineInputParser';
import { CommandLineOptions } from './models/CommandLineOptions';

describe('CommandLineInputParser', () => {
  let parserStub: sinon.SinonStub;

  describe('parse', () => {
    let parseArgsStub: sinon.SinonStub;
    let addArgumentStub: sinon.SinonStub;

    beforeEach(() => {
      parseArgsStub = sinon.stub();
      addArgumentStub = sinon.stub();
    });

    it('should set the output property on CommandLineOptions', () => {
      // Arrange
      const testOutput: string = 'outputDirectory';
      parseArgsStub.returns({
        output: testOutput
      });
      parserStub = sinon.stub(a, 'ArgumentParser');
      parserStub.returns({
        parseArgs: parseArgsStub,
        addArgument: addArgumentStub
      });
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.output, testOutput);
    });

    it('should initialize the output argument', () => {
      // Arrange
      parserStub = sinon.stub(a, 'ArgumentParser');
      parserStub.returns({
        parseArgs: parseArgsStub,
        addArgument: addArgumentStub
      });
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ 'output' ],
        {
          type: 'string',
          help: 'The output directory path'
        }
      ).calledOnce);
    });
  });

  afterEach(() => {
    if (parserStub != null) {
      parserStub.restore();
    }
  });
});
