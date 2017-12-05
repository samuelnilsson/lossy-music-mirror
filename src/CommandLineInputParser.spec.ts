/**
 * Tests for the CommandLineInputParser class
 */

import * as a from 'argparse';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { CommandLineInputParser } from './CommandLineInputParser';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';

describe('CommandLineInputParser', () => {
  let parserStub: sinon.SinonStub;

  beforeEach(() => {
    parserStub = sinon.stub(a, 'ArgumentParser');
  });

  afterEach(() => {
    if (parserStub != null) {
      parserStub.restore();
    }
  });

  describe('parse', () => {
    let parseArgsStub: sinon.SinonStub;
    let addArgumentStub: sinon.SinonStub;
    let validParseArgs: any;

    beforeEach(() => {
      validParseArgs = {
        output: 'any',
        quality: null
      };
      parseArgsStub = sinon.stub();
      addArgumentStub = sinon.stub();
      parseArgsStub.returns(validParseArgs);
      parserStub.returns({
        parseArgs: parseArgsStub,
        addArgument: addArgumentStub
      });
    });

    it('should set the output property on CommandLineOptions', () => {
      // Arrange
      const testOutput: string = 'outputDirectory';
      validParseArgs.output = testOutput;
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.output, testOutput);
    });

    it('should initialize the output argument', () => {
      // Arrange
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

    it('should set the quality property on CommandLineOptions', () => {
      // Arrange
      const testQuality: number = 5;
      validParseArgs.quality = testQuality;
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.quality, testQuality);
    });

    it('should set the quality to 3 on CommandLineOptions by default', () => {
      // Arrange
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.quality, 3);
    });

    it('should initialize the quality argument', () => {
      // Arrange
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '-q', '--quality' ],
        {
          type: 'int',
          help: 'The vorbis quality (0-10 [default = 3])'
        }
      ).calledOnce);
    });

    it('should set the input directory property on CommandLineOptions', () => {
      // Arrange
      const testInput: string = 'anyInput';
      validParseArgs.input = testInput;
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.input, testInput);
    });

    it('should set the input directory to the current directory by default', () => {
      // Arrange
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.equal(result.input, './');
    });

    it('should initialize the input directory argument', () => {
      // Arrange
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      const result: CommandLineOptions = commandLineParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '-i', '--input' ],
        {
          type: 'string',
          help: 'The input directory path'
        }
      ).calledOnce);
    });

    it('should not be possible to add arguments more than once', () => {
      // Arrange
      const commandLineParser: CommandLineInputParser = new CommandLineInputParser();

      // Act
      commandLineParser.parse();
      const callCount: number = addArgumentStub.callCount;
      commandLineParser.parse();
      const addedMoreThanOnce: boolean = callCount !== addArgumentStub.callCount;

      // Assert
      assert.isFalse(addedMoreThanOnce);
    });
  });

  describe('validate', () => {
    let parseStub: sinon.SinonStub;
    let validOptions: CommandLineOptions;
    let parser: CommandLineInputParser;
    let consoleInfoStub: sinon.SinonStub;
    let fileIsDirectoryStub: sinon.SinonStub;

    beforeEach(() => {
      parser = new CommandLineInputParser();
      validOptions = new CommandLineOptions('output', 3, 'input');
      parseStub = sinon.stub(parser, 'parse');
      parseStub.returns(validOptions);
      consoleInfoStub = sinon.stub(console, 'info');
      fileIsDirectoryStub = sinon.stub(file, 'isDirectory')
        .returns(true);
    });

    afterEach(() => {
      if (parseStub != null) {
        parseStub.restore();
      }
      if (consoleInfoStub != null) {
        consoleInfoStub.restore();
      }
      if (fileIsDirectoryStub != null) {
        fileIsDirectoryStub.restore();
      }
    });

    it('should return true if all options are valid', () => {
      // Act
      const result: boolean = parser.validate();

      // Assert
      assert.isTrue(result);
    });

    it('should return true if quality is an int between 0-10', () => {
      // Arrange
      validOptions.quality = 0;

      // Act
      const zeroResult: boolean = parser.validate();

      // Arrange
      validOptions.quality = 10;

      // Act
      const tenResult: boolean = parser.validate();

      // Assert
      assert.isTrue(zeroResult);
      assert.isTrue(tenResult);
    });

    it('should return false if quality is a negative number', () => {
      // Arrange
      validOptions.quality = -1;

      // Act
      const result: boolean = parser.validate();

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is a negative number', () => {
      // Arrange
      validOptions.quality = -1;

      // Act
      parser.validate();

      // Assert
      const isCalledOnce: boolean = consoleInfoStub.calledOnce;
      const isCalled: boolean = consoleInfoStub.withArgs(
        `lossy-music-mirror: error: argument "-q/--quality": The value ` +
          `must be between 0 and 10`).called;
      assert.isTrue(isCalledOnce);
      assert.isTrue(isCalled);
    });

    it('should return false if quality is larger than 10', () => {
      // Arrange
      validOptions.quality = 11;

      // Act
      const result: boolean = parser.validate();

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is larger than 10', () => {
      // Arrange
      validOptions.quality = 11;

      // Act
      parser.validate();

      // Assert
      const isCalledOnce: boolean = consoleInfoStub.calledOnce;
      const isCalled: boolean = consoleInfoStub.withArgs(
        `lossy-music-mirror: error: argument "-q/--quality": The value ` +
          `must be between 0 and 10`).called;
      assert.isTrue(isCalledOnce);
      assert.isTrue(isCalled);
    });

    it('should return false if quality is a decimal', () => {
      // Arrange
      validOptions.quality = 4.4;

      // Act
      const result: boolean = parser.validate();

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is a decimal', () => {
      // Arrange
      validOptions.quality = 4.4;

      // Act
      parser.validate();

      // Assert
      const isCalledOnce: boolean = consoleInfoStub.calledOnce;
      const isCalled: boolean = consoleInfoStub.withArgs(
        `lossy-music-mirror: error: argument "-q/--quality": The value ` +
          `can't be a decimal`).called;
      assert.isTrue(isCalledOnce);
      assert.isTrue(isCalled);
    });

    it('should return false if input is not a directory', () => {
      // Arrange
      validOptions.input = 'invalidDirectory';
      fileIsDirectoryStub.returns(false);

      // Act
      const result: boolean = parser.validate();

      // Assert
      assert.isFalse(result);
    });

    it('should return an error message if input is not a directory', () => {
      // Arrange
      validOptions.input = 'invalidDirectory';
      fileIsDirectoryStub.returns(false);

      // Act
      parser.validate();

      // Assert
      const isCalledOnce: boolean = consoleInfoStub.calledOnce;
      const isCalled: boolean = consoleInfoStub.withArgs(
        `lossy-music-mirror: error: argument "-i/--input": The value ` +
          `must be an existing directory`).called;
      assert.isTrue(isCalledOnce);
      assert.isTrue(isCalled);
    });
  });
});
