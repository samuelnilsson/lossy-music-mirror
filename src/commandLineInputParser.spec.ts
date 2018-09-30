/**
 * Tests for the CommandLineInputParser module
 */

import * as a from 'argparse';
import { assert } from 'chai';
import * as sinon from 'sinon';
import * as commandLineInputParser from './commandLineInputParser';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';
import { Mp3 } from './models/Mp3';
import { Opus } from './models/Opus';
import { Vorbis } from './models/Vorbis';

describe('commandLineInputParser', () => {
  let sandbox: sinon.SinonSandbox;
  let parserStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    parserStub = sandbox.stub(a, 'ArgumentParser');
  });

  afterEach(() => {
    sandbox.restore();
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
      parseArgsStub = sandbox.stub();
      addArgumentStub = sandbox.stub();
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

    it('should set the quality to 3 on CommandLineOptions by default if codec is vorbis', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.equal(result.quality, 3);
    });

    it('should set the quality to 4 on CommandLineOptions by default if codec is mp3', () => {
      // Arrange
      validParseArgs.codec = 'mp3';

      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.equal(result.quality, 4);
    });

    it('should set the quality to 64000 on CommandLineOptions by default if codec is opus', () => {
      // Arrange
      validParseArgs.codec = 'opus';

      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.equal(result.quality, 64000);
    });

    it('should initialize the quality argument', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '-q', '--quality' ],
        {
          type: 'int',
          help: 'The output quality (0-10 [default = 3] for vorbis, 0-9 [default = 4] (lower value is higher quality) for mp3 or ' +
            '500-256000 [default = 64000] for opus'
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

    it('should initialize the input directory argument', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '-i', '--input' ],
        {
          type: 'string',
          help: 'The input directory path [default = ./]',
          defaultValue: './'
        }
      ).calledOnce);
    });

    it('should map the codec argument to the correct codec type', () => {
      // Arrange
      const vorbis: string = 'vorbis';
      const mp3: string = 'mp3';
      const opus: string = 'opus';

      // Act
      validParseArgs.codec = vorbis;
      const vorbisResult: CommandLineOptions = commandLineInputParser.parse();

      validParseArgs.codec = mp3;
      const mp3Result: CommandLineOptions = commandLineInputParser.parse();

      validParseArgs.codec = opus;
      const opusResult: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(vorbisResult.codec instanceof Vorbis);
      assert.isTrue(mp3Result.codec instanceof Mp3);
      assert.isTrue(opusResult.codec instanceof Opus);
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
          choices: ['vorbis', 'mp3', 'opus']
        }
      ).calledOnce);
    });

    it('should set the deleteFiles property on CommandLineOptions', () => {
      // Act
      validParseArgs.deleteFiles = true;
      const trueResult: CommandLineOptions = commandLineInputParser.parse();
      validParseArgs.deleteFiles = false;
      const falseResult: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(trueResult.deleteFiles);
      assert.isFalse(falseResult.deleteFiles);
    });

    it('should initialize the delete argument', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '--delete' ],
        {
          help: 'Delete files in output that does not have a corresponding lossless file in input',
          dest: 'deleteFiles',
          action: 'storeTrue',
          defaultValue: false
        }
      ).calledOnce);
    });

    it('should set the noAsk property on CommandLineOptions', () => {
      // Act
      validParseArgs.noAsk = true;
      const trueResult: CommandLineOptions = commandLineInputParser.parse();
      validParseArgs.noAsk = false;
      const falseResult: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(trueResult.noAsk);
      assert.isFalse(falseResult.noAsk);
    });

    it('should initialize the noAsk argument', () => {
      // Act
      const result: CommandLineOptions = commandLineInputParser.parse();

      // Assert
      assert.isTrue(addArgumentStub.withArgs(
        [ '--no-ask' ],
        {
          help: 'Disable questions',
          dest: 'noAsk',
          action: 'storeTrue',
          defaultValue: false
        }
      ).calledOnce);
    });
  });

  describe('validate', () => {
    let validOptions: CommandLineOptions;
    let consoleInfoStub: sinon.SinonStub;
    let fileIsDirectoryStub: sinon.SinonStub;

    beforeEach(() => {
      validOptions = new CommandLineOptions('output', 3, 'input', new Vorbis(), false, false);
      consoleInfoStub = sandbox.stub(console, 'info');
      fileIsDirectoryStub = sandbox.stub(file, 'isDirectory')
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

    it('should return true if quality is an int between 0-10 and codec is vorbis', () => {
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

    it('should return true if quality is an int between 0-9 and codec is mp3', () => {
      // Arrange
      validOptions.codec = new Mp3();
      validOptions.quality = 0;

      // Act
      const zeroResult: boolean = commandLineInputParser.validate(validOptions);

      // Arrange
      validOptions.quality = 9;

      // Act
      const tenResult: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isTrue(zeroResult);
      assert.isTrue(tenResult);
    });

    it('should return true if quality is an int between 500-256000 and codec is opus', () => {
      // Arrange
      validOptions.codec = new Opus();
      validOptions.quality = 500;

      // Act
      const lowResult: boolean = commandLineInputParser.validate(validOptions);

      // Arrange
      validOptions.quality = 256000;

      // Act
      const highResult: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isTrue(lowResult);
      assert.isTrue(highResult);
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

    it('should return false if quality is larger than 10 and codec is vorbis', () => {
      // Arrange
      validOptions.quality = 11;

      // Act
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is larger than 10 and codec is vorbis', () => {
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

    it('should return false if quality is larger than 9 and codec is mp3', () => {
      // Arrange
      validOptions.codec = new Mp3();
      validOptions.quality = 10;

      // Act
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is larger than 9 and codec is mp3', () => {
      // Arrange
      validOptions.codec = new Mp3();
      validOptions.quality = 10;

      // Act
      commandLineInputParser.validate(validOptions);

      // Assert
      const isCalledOnce: boolean = consoleInfoStub.calledOnce;
      const isCalled: boolean = consoleInfoStub.withArgs(
        `lossy-music-mirror: error: argument "-q/--quality": The value ` +
          `must be between 0 and 9`).called;
      assert.isTrue(isCalledOnce);
      assert.isTrue(isCalled);
    });

    it('should return false if quality is larger than 256000 and codec is opus', () => {
      // Arrange
      validOptions.codec = new Opus();
      validOptions.quality = 256001;

      // Act
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is larger than 256000 and codec is opus', () => {
      // Arrange
      validOptions.codec = new Opus();
      validOptions.quality = 256001;

      // Act
      commandLineInputParser.validate(validOptions);

      // Assert
      const isCalledOnce: boolean = consoleInfoStub.calledOnce;
      const isCalled: boolean = consoleInfoStub.withArgs(
        `lossy-music-mirror: error: argument "-q/--quality": The value ` +
          `must be between 500 and 256000`).called;
      assert.isTrue(isCalledOnce);
      assert.isTrue(isCalled);
    });

    it('should return false if quality is lower than 500 and codec is opus', () => {
      // Arrange
      validOptions.codec = new Opus();
      validOptions.quality = 499;

      // Act
      const result: boolean = commandLineInputParser.validate(validOptions);

      // Assert
      assert.isFalse(result);
    });

    it('should print an error message if quality is lower than 500 and codec is opus', () => {
      // Arrange
      validOptions.codec = new Opus();
      validOptions.quality = 499;

      // Act
      commandLineInputParser.validate(validOptions);

      // Assert
      const isCalledOnce: boolean = consoleInfoStub.calledOnce;
      const isCalled: boolean = consoleInfoStub.withArgs(
        `lossy-music-mirror: error: argument "-q/--quality": The value ` +
          `must be between 500 and 256000`).called;
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
