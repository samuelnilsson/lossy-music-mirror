/**
 * Tests for the CommandLineInputParser module
 */

import * as a from 'argparse';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as commandLineInputParser from './commandLineInputParser';
import * as file from './file';
import { Codec, CommandLineOptions } from './models/CommandLineOptions';

describe('commandLineInputParser', () => {
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
        quality: null,
        input: null,
        codec: 'vorbis'
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

      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.equal(result.output, testOutput);
    });

    it('should initialize the output argument', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

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

      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.equal(result.quality, testQuality);
    });

    it('should set the quality to 3 on CommandLineOptions by default', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.equal(result.quality, 3);
    });

    it('should initialize the quality argument', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

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

      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.equal(result.input, testInput);
    });

    it('should set the input directory to the current directory by default', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.equal(result.input, './');
    });

    it('should initialize the input directory argument', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '-i', '--input' ],
        {
          type: 'string',
          help: 'The input directory path [default = ./]'
        }
      ).calledOnce);
    });

    it('should map the codec argument to the correct Codec enum', () => {
      // Arrange
      const vorbis: string = 'vorbis';
      const mp3: string = 'mp3';

      // Act
      validParseArgs.codec = vorbis;
      const vorbisResult: CommandLineOptions = commandLineInputParser.parse();

      validParseArgs.codec = mp3;
      const mp3Result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.deepEqual(vorbisResult.codec, Codec.Vorbis);
      assert.deepEqual(mp3Result.codec, Codec.Mp3);
    });

    it('should initialize the codec argument', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '-c', '--codec' ],
        {
          type: 'string',
          help: 'The output codec [default = vorbis]',
          defaultValue: 'vorbis',
          choices: ['vorbis', 'mp3']
        }
      ).calledOnce);
    });
  });

  describe('validate', () => {
    let validOptions: CommandLineOptions;
    let consoleInfoStub: sinon.SinonStub;
    let fileIsDirectoryStub: sinon.SinonStub;

    beforeEach(() => {
      validOptions = new CommandLineOptions('output', 3, 'input', Codec.Vorbis);
      consoleInfoStub = sinon.stub(console, 'info');
      fileIsDirectoryStub = sinon.stub(file, 'isDirectory')
        .returns(true);
    });

    afterEach(() => {
      if (consoleInfoStub != null) {
        consoleInfoStub.restore();
      }
      if (fileIsDirectoryStub != null) {
        fileIsDirectoryStub.restore();
      }
    });

    it('should return true if all options are valid', () => {
      // Act
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isTrue(result);
    });

    it('should return true if quality is an int between 0-10', () => {
      // Arrange
      validOptions.quality = 0;

      // Act
      const zeroResult: boolean = commandLineInputParser.validate(validOptions);

      // Arrange
      validOptions.quality = 10;

      // Act
      const tenResult: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isTrue(zeroResult);
      assert.isTrue(tenResult);
    });

    it('should return false if quality is a negative number', () => {
      // Arrange
      validOptions.quality = -1;

      // Act
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is a negative number', () => {
      // Arrange
      validOptions.quality = -1;

      // Act
      commandLineInputParser.validate(validOptions);

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
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is larger than 10', () => {
      // Arrange
      validOptions.quality = 11;

      // Act
      commandLineInputParser.validate(validOptions);

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
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is a decimal', () => {
      // Arrange
      validOptions.quality = 4.4;

      // Act
      commandLineInputParser.validate(validOptions);

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
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isFalse(result);
    });

    it('should return an error message if input is not a directory', () => {
      // Arrange
      validOptions.input = 'invalidDirectory';
      fileIsDirectoryStub.returns(false);

      // Act
      commandLineInputParser.validate(validOptions);

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
