/**
 * Tests for the app module
 */

import { assert } from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import * as app from './app';
import * as audio from './audio';
import * as commandLineInputParser from './commandLineInputParser';
import * as directoryIterator from './directoryIterator';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';

describe('app', () => {
  describe('run', () => {
    let directoryIteratorStub: sinon.SinonStub;
    let processStdoutStub: sinon.SinonSpy;
    let audioTranscodeStub: sinon.SinonStub;
    let audioIsLosslessStub: sinon.SinonStub;
    let pathRelativeStub: sinon.SinonStub;
    let pathResolveStub: sinon.SinonStub;
    let pathJoinStub: sinon.SinonStub;
    let fileGetRelativePathStub: sinon.SinonStub;
    let fileCreateDirectoryStub: sinon.SinonStub;
    let testData: string[];
    let options: CommandLineOptions;
    let commandLineInputParserValidateStub: sinon.SinonStub;
    let consoleInfoStub: sinon.SinonStub;

    beforeEach(() => {
      processStdoutStub = sinon.stub(process.stdout, 'write');
      audioTranscodeStub = sinon.stub(audio, 'transcode');
      audioIsLosslessStub = sinon.stub(audio, 'isLossless');
      pathRelativeStub = sinon.stub(path, 'relative');
      pathResolveStub = sinon.stub(path, 'resolve');
      pathJoinStub = sinon.stub(path, 'join');
      fileGetRelativePathStub = sinon.stub(file, 'getRelativePath');
      fileCreateDirectoryStub = sinon.stub(file, 'createDirectory');
      commandLineInputParserValidateStub = sinon.stub(commandLineInputParser, 'validate');
      consoleInfoStub = sinon.stub(console, 'info');

      options = new CommandLineOptions('outputDir', 3, 'inputDir');
      testData = [
        '/any/musicFile.flac',
        '/any2/musicFile2.flac',
        '/any3/otherFile.other'
      ];

      fileGetRelativePathStub.withArgs('inputDir', testData[0]).returns('relOutput1');
      fileGetRelativePathStub.withArgs('inputDir', testData[1]).returns('relOutput2');
      fileGetRelativePathStub.withArgs('inputDir', testData[2]).returns('relOutput3');

      pathJoinStub.withArgs('outputDir', 'relOutput1').returns('joinedOutput1');
      pathJoinStub.withArgs('outputDir', 'relOutput2').returns('joinedOutput2');
      pathJoinStub.withArgs('outputDir', 'relOutput3').returns('joinedOutput3');

      audioIsLosslessStub.withArgs(testData[0]).returns(true);
      audioIsLosslessStub.withArgs(testData[1]).returns(true);
      audioIsLosslessStub.withArgs(testData[2]).returns(false);

      commandLineInputParserValidateStub.returns(true);

      directoryIteratorStub = createDirectoryIteratorStub(testData);
    });

    it('should validate the options', () => {
      // Act
      app.run(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(consoleInfoStub.withArgs('Validation failed.').notCalled);
    });

    it('should print a validation failure message and exit if options validation fails', () => {
      // Arrange
      commandLineInputParserValidateStub.withArgs(options).returns(false);

      // Act
      app.run(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(consoleInfoStub.calledWith('Validation failed.'));
      assert.isTrue(fileCreateDirectoryStub.notCalled);
      assert.isTrue(audioTranscodeStub.notCalled);
    });

    it('should print current file number and the total number of files', () => {
      // Act
      app.run(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(processStdoutStub.withArgs('1/2: ').calledOnce);
      assert.isTrue(processStdoutStub.withArgs('2/2: ').calledOnce);
      assert.isTrue(processStdoutStub.calledTwice);
    });

    it('should create the directory of the output file', () => {
      // Act
      app.run(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(fileCreateDirectoryStub.withArgs('joinedOutput1').calledOnce);
      assert.isTrue(fileCreateDirectoryStub.withArgs('joinedOutput2').calledOnce);
      assert.isTrue(fileCreateDirectoryStub.calledTwice);
    });

    it('should transcode the file', () => {
      // Act
      app.run(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(audioTranscodeStub.withArgs(testData[0], 'joinedOutput1', options).calledOnce);
      assert.isTrue(audioTranscodeStub.withArgs(testData[1], 'joinedOutput2', options).calledOnce);
      assert.isTrue(audioTranscodeStub.calledTwice);
    });

    it('should print file count before creating the output directory', () => {
      // Act
      app.run(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(processStdoutStub.calledBefore(fileCreateDirectoryStub));
    });

    it('should create the output directory before transcoding', () => {
      // Act
      app.run(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(fileCreateDirectoryStub.calledBefore(audioTranscodeStub));
    });

    afterEach(() => {
      if (directoryIteratorStub != null) {
        directoryIteratorStub.restore();
      }
      if (processStdoutStub != null) {
        processStdoutStub.restore();
      }
      if (audioTranscodeStub != null) {
        audioTranscodeStub.restore();
      }
      if (audioIsLosslessStub != null) {
        audioIsLosslessStub.restore();
      }
      if (pathRelativeStub != null) {
        pathRelativeStub.restore();
      }
      if (pathResolveStub != null) {
        pathResolveStub.restore();
      }
      if (pathJoinStub != null) {
        pathJoinStub.restore();
      }
      if (fileGetRelativePathStub != null) {
        fileGetRelativePathStub.restore();
      }
      if (fileCreateDirectoryStub != null) {
        fileCreateDirectoryStub.restore();
      }
      if (commandLineInputParserValidateStub != null) {
        commandLineInputParserValidateStub.restore();
      }
      if (consoleInfoStub != null) {
        consoleInfoStub.restore();
      }
    });
  });
});

function createDirectoryIteratorStub(callbackParameters: string[]): sinon.SinonStub {
  function stubFunction(input: string, callback: (filePath: string) => void): void {
    for (const callbackParameter of callbackParameters) {
      callback(callbackParameter);
    }
  }
  const directoryIteratorStub: sinon.SinonStub = sinon.stub(directoryIterator, 'run');
  directoryIteratorStub.callsFake(stubFunction);

  return directoryIteratorStub;
}
