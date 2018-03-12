/**
 * Tests for the app module
 */

import { assert } from 'chai';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sinon from 'sinon';
import * as app from './app';
import * as audio from './audio';
import * as commandLineInputParser from './commandLineInputParser';
import * as directoryIterator from './directoryIterator';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';
import { Mp3 } from './models/Mp3';
import { Vorbis } from './models/Vorbis';

describe('app', () => {
  let directoryIteratorStub: sinon.SinonStub;
  let audioTranscodeStub: sinon.SinonStub;
  let audioIsLosslessStub: sinon.SinonStub;
  let pathJoinStub: sinon.SinonStub;
  let fileGetRelativePathStub: sinon.SinonStub;
  let fileCreateDirectoryStub: sinon.SinonStub;
  let commandLineInputParserValidateStub: sinon.SinonStub;
  let consoleInfoStub: sinon.SinonStub;
  let getFilesToDeleteStub: sinon.SinonStub;
  let fileDeleteFilesStub: sinon.SinonStub;
  let startTranscodeStub: sinon.SinonStub;
  let processStdoutStub: sinon.SinonStub;
  let fileGetFilesByFileNameStub: sinon.SinonStub;
  let fileGetFileNameStub: sinon.SinonStub;
  let audioGetCodecStub: sinon.SinonStub;
  let audioIsSameCodecStub: sinon.SinonStub;
  let fsExistsSyncStub: sinon.SinonStub;
  let countNumberOfLosslessFilesStub: sinon.SinonStub;

  let testData: string[];
  let options: CommandLineOptions;

  beforeEach(() => {
    audioTranscodeStub = sinon.stub(audio, 'transcode');
    audioIsLosslessStub = sinon.stub(audio, 'isLossless');
    pathJoinStub = sinon.stub(path, 'join');
    fileGetRelativePathStub = sinon.stub(file, 'getRelativePath');
    fileCreateDirectoryStub = sinon.stub(file, 'createDirectory');
    commandLineInputParserValidateStub = sinon.stub(commandLineInputParser, 'validate');
    consoleInfoStub = sinon.stub(console, 'info');
    fileDeleteFilesStub = sinon.stub(file, 'deleteFiles');
    fileGetFilesByFileNameStub = sinon.stub(file, 'getFilesByFilename');
    fileGetFileNameStub = sinon.stub(file, 'getFilename');
    audioGetCodecStub = sinon.stub(audio, 'getCodec');
    audioIsSameCodecStub = sinon.stub(audio, 'isSameCodec');
    fsExistsSyncStub = sinon.stub(fs, 'existsSync');
  });

  describe('run', () => {
    let filesToDeleteTestResponse: string[];

    beforeEach(() => {
      startTranscodeStub = sinon.stub(app, 'startTranscode');
      getFilesToDeleteStub = sinon.stub(app, 'getFilesToDelete');

      options = new CommandLineOptions('outputDir', 3, 'inputDir', new Vorbis());
      commandLineInputParserValidateStub.withArgs(options).returns(true);

      filesToDeleteTestResponse = [
        'fileToDelete1',
        'fileToDelete2'
      ];
      getFilesToDeleteStub
        .withArgs(options.input, options.output, options.codec)
        .returns(filesToDeleteTestResponse);
    });

    it('should validate the options', () => {
      // Act
      app.run(options);

      // Assert
      assert.isTrue(consoleInfoStub.withArgs('Validation failed.').notCalled);
    });

    it('should print a validation failure message and exit if options validation fails', () => {
      // Arrange
      commandLineInputParserValidateStub.withArgs(options).returns(false);

      // Act
      app.run(options);

      // Assert
      assert.isTrue(consoleInfoStub.calledWith('Validation failed.'));
      assert.isTrue(consoleInfoStub.calledOnce);
      assert.isTrue(fileDeleteFilesStub.notCalled);
      assert.isTrue(startTranscodeStub.notCalled);
    });

    it('should delete files returned by getFilesToDelete', () => {
      // Act
      app.run(options);

      // Assert
      assert.isTrue(fileDeleteFilesStub.calledOnce);
      assert.isTrue(fileDeleteFilesStub.calledWithExactly(filesToDeleteTestResponse));
    });

    it('should start the transcoding', () => {
      // Act
      app.run(options);

      // Assert
      assert.isTrue(startTranscodeStub.calledOnce);
    });

    it('should delete the files before transcoding', () => {
      // Act
      app.run(options);

      // Assert
      assert.isTrue(fileDeleteFilesStub.calledBefore(startTranscodeStub));
    });
  });

  describe('getFilesToDelete', () => {
    let testInputDirectory: string;
    let testOutputDirectory: string;
    let testOutputCodec: Vorbis;

    beforeEach(() => {
      testInputDirectory = 'inputDir';
      testOutputDirectory = 'outputDir';
      testOutputCodec = new Vorbis();
    });

    it('should return the file if it lossy and different from outputCodec', () => {
      // Arrange
      testData = [
        '/any/otherFile.mp3'
      ];
      fsExistsSyncStub.withArgs(testOutputDirectory).returns(true);
      audioGetCodecStub.withArgs(testData[0]).returns(new Mp3());
      audioIsSameCodecStub.withArgs(new Mp3(), testOutputCodec).returns(false);
      fileGetRelativePathStub.withArgs(testOutputDirectory, testData[0]).returns('relOutput');
      pathJoinStub.withArgs(testInputDirectory, 'relOutput').returns('joinedOutput');
      fileGetFileNameStub.withArgs(testData[0]).returns('musicFile');
      fileGetFilesByFileNameStub.withArgs('joinedOutput', 'musicFile').returns(['matchingFile.flac']);
      audioIsLosslessStub.withArgs('matchingFile.flac').returns(true);

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory);

      // Act
      const result: string[] = app.getFilesToDelete(testInputDirectory, testOutputDirectory, testOutputCodec);

      // Assert
      assert.deepEqual(result, testData);
    });

    it('should return the file if it is not an audio file', () => {
      // Arrange
      testData = [
        '/any/otherFile.other'
      ];
      fsExistsSyncStub.withArgs(testOutputDirectory).returns(true);
      audioGetCodecStub.withArgs(testData[0]).returns(null);
      audioIsSameCodecStub.withArgs(new Vorbis(), testOutputCodec).returns(true);
      fileGetRelativePathStub.withArgs(testOutputDirectory, testData[0]).returns('relOutput');
      pathJoinStub.withArgs(testInputDirectory, 'relOutput').returns('joinedOutput');
      fileGetFileNameStub.withArgs(testData[0]).returns('musicFile');
      fileGetFilesByFileNameStub.withArgs('joinedOutput', 'musicFile').returns(['matchingFile.flac']);
      audioIsLosslessStub.withArgs('matchingFile.flac').returns(true);

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory);

      // Act
      const result: string[] = app.getFilesToDelete(testInputDirectory, testOutputDirectory, testOutputCodec);

      // Assert
      assert.deepEqual(result, testData);
    });

    it('should return the file if it does not have a matching input file', () => {
      // Arrange
      testData = [
        '/any/otherFile.ogg'
      ];
      fsExistsSyncStub.withArgs(testOutputDirectory).returns(true);
      audioGetCodecStub.withArgs(testData[0]).returns(new Vorbis());
      audioIsSameCodecStub.withArgs(new Vorbis(), testOutputCodec).returns(true);
      fileGetRelativePathStub.withArgs(testOutputDirectory, testData[0]).returns('relOutput');
      pathJoinStub.withArgs(testInputDirectory, 'relOutput').returns('joinedOutput');
      fileGetFileNameStub.withArgs(testData[0]).returns('musicFile');
      fileGetFilesByFileNameStub.withArgs('joinedOutput', 'musicFile').returns([]);
      audioIsLosslessStub.withArgs('matchingFile.flac').returns(true);

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory);

      // Act
      const result: string[] = app.getFilesToDelete(testInputDirectory, testOutputDirectory, testOutputCodec);

      // Assert
      assert.deepEqual(result, testData);
    });

    it('should return the file if none of the matching input files are lossless', () => {
      // Arrange
      testData = [
        '/any/otherFile.ogg'
      ];
      fsExistsSyncStub.withArgs(testOutputDirectory).returns(true);
      audioGetCodecStub.withArgs(testData[0]).returns(new Vorbis());
      audioIsSameCodecStub.withArgs(new Vorbis(), testOutputCodec).returns(true);
      fileGetRelativePathStub.withArgs(testOutputDirectory, testData[0]).returns('relOutput');
      pathJoinStub.withArgs(testInputDirectory, 'relOutput').returns('joinedOutput');
      fileGetFileNameStub.withArgs(testData[0]).returns('musicFile');
      fileGetFilesByFileNameStub.withArgs('joinedOutput', 'musicFile').returns(['matchingFile.ogg']);
      audioIsLosslessStub.withArgs('matchingFile.ogg').returns(false);

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory);

      // Act
      const result: string[] = app.getFilesToDelete(testInputDirectory, testOutputDirectory, testOutputCodec);

      // Assert
      assert.deepEqual(result, testData);
    });

    it('should not return the file if it has a matching lossless file', () => {
      // Arrange
      testData = [
        '/any/otherFile.ogg'
      ];
      fsExistsSyncStub.withArgs(testOutputDirectory).returns(true);
      audioGetCodecStub.withArgs(testData[0]).returns(new Vorbis());
      audioIsSameCodecStub.withArgs(new Vorbis(), testOutputCodec).returns(true);
      fileGetRelativePathStub.withArgs(testOutputDirectory, testData[0]).returns('relOutput');
      pathJoinStub.withArgs(testInputDirectory, 'relOutput').returns('joinedOutput');
      fileGetFileNameStub.withArgs(testData[0]).returns('musicFile');
      fileGetFilesByFileNameStub.withArgs('joinedOutput', 'musicFile').returns(['matchingFile.ogg', 'matchingFile.flac']);
      audioIsLosslessStub.withArgs('matchingFile.flac').returns(true);

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory);

      // Act
      const result: string[] = app.getFilesToDelete(testInputDirectory, testOutputDirectory, testOutputCodec);

      // Assert
      assert.deepEqual(result, []);
    });

    it('should return an empty list if the output directory does not exist', () => {
      // Arrange
      testData = [
        '/any/otherFile.ogg'
      ];
      fsExistsSyncStub.withArgs(testOutputDirectory).returns(false);
      audioGetCodecStub.withArgs(testData[0]).returns(new Vorbis());
      audioIsSameCodecStub.withArgs(new Vorbis(), testOutputCodec).returns(true);
      fileGetRelativePathStub.withArgs(testOutputDirectory, testData[0]).returns('relOutput');
      pathJoinStub.withArgs(testInputDirectory, 'relOutput').returns('joinedOutput');
      fileGetFileNameStub.withArgs(testData[0]).returns('musicFile');
      fileGetFilesByFileNameStub.withArgs('joinedOutput', 'musicFile').returns(['matchingFile.ogg', 'matchingFile.flac']);
      audioIsLosslessStub.withArgs('matchingFile.flac').returns(true);

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory);

      // Act
      const result: string[] = app.getFilesToDelete(testInputDirectory, testOutputDirectory, testOutputCodec);

      // Assert
      assert.deepEqual(result, []);
    });
  });

  describe('startTranscode', () => {
    beforeEach(() => {
      processStdoutStub = sinon.stub(process.stdout, 'write');
      countNumberOfLosslessFilesStub = sinon.stub(app, 'countNumberOfLosslessFiles');
      countNumberOfLosslessFilesStub.withArgs('inputDir').returns(2);

      options = new CommandLineOptions('outputDir', 3, 'inputDir', new Vorbis());
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

      directoryIteratorStub = createDirectoryIteratorStub(testData, 'inputDir');
    });

    it('should print current file number and the total number of files', () => {
      // Act
      app.startTranscode(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(processStdoutStub.withArgs('1/2: ').calledOnce);
      assert.isTrue(processStdoutStub.withArgs('2/2: ').calledOnce);
      assert.isTrue(processStdoutStub.calledTwice);
    });

    it('should create the directory of the output file', () => {
      // Act
      app.startTranscode(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(fileCreateDirectoryStub.withArgs('joinedOutput1').calledOnce);
      assert.isTrue(fileCreateDirectoryStub.withArgs('joinedOutput2').calledOnce);
      assert.isTrue(fileCreateDirectoryStub.calledTwice);
    });

    it('should transcode the file', () => {
      // Act
      app.startTranscode(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(audioTranscodeStub.withArgs(testData[0], 'joinedOutput1', options).calledOnce);
      assert.isTrue(audioTranscodeStub.withArgs(testData[1], 'joinedOutput2', options).calledOnce);
      assert.isTrue(audioTranscodeStub.calledTwice);
    });

    it('should print file count before creating the output directory', () => {
      // Act
      app.startTranscode(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(processStdoutStub.calledBefore(fileCreateDirectoryStub));
    });

    it('should create the output directory before transcoding', () => {
      // Act
      app.startTranscode(options);
      processStdoutStub.restore();

      // Assert
      assert.isTrue(fileCreateDirectoryStub.calledBefore(audioTranscodeStub));
    });
  });

  describe('countNumberOfLosslessFiles', () => {
    beforeEach(() => {
      testData = [
        '/any/musicFile.flac',
        '/any2/musicFile2.flac',
        '/any3/otherFile.other'
      ];

      audioIsLosslessStub.withArgs(testData[0]).returns(true);
      audioIsLosslessStub.withArgs(testData[1]).returns(true);
      audioIsLosslessStub.withArgs(testData[2]).returns(false);

      directoryIteratorStub = createDirectoryIteratorStub(testData, 'inputDir');
    });

    it('should return the correct number of lossless files', () => {
      // Act
      const result: number = app.countNumberOfLosslessFiles('inputDir');

      // Assert
      assert.deepEqual(result, 2);
    });
  });

  afterEach(() => {
    if (directoryIteratorStub != null) {
      directoryIteratorStub.restore();
    }
    if (audioTranscodeStub != null) {
      audioTranscodeStub.restore();
    }
    if (audioIsLosslessStub != null) {
      audioIsLosslessStub.restore();
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
    if (getFilesToDeleteStub != null) {
      getFilesToDeleteStub.restore();
    }
    if (fileDeleteFilesStub != null) {
      fileDeleteFilesStub.restore();
    }
    if (startTranscodeStub != null) {
      startTranscodeStub.restore();
    }
    if (processStdoutStub != null) {
      processStdoutStub.restore();
    }
    if (fileGetFilesByFileNameStub != null) {
      fileGetFilesByFileNameStub.restore();
    }
    if (fileGetFileNameStub != null) {
      fileGetFileNameStub.restore();
    }
    if (audioGetCodecStub != null) {
      audioGetCodecStub.restore();
    }
    if (audioIsSameCodecStub != null) {
      audioIsSameCodecStub.restore();
    }
    if (fsExistsSyncStub != null) {
      fsExistsSyncStub.restore();
    }
    if (countNumberOfLosslessFilesStub != null) {
      countNumberOfLosslessFilesStub.restore();
    }
  });
});

function createDirectoryIteratorStub(callbackParameters: string[], withArgs: string): sinon.SinonStub {
  function stubFunction(input: string, callback: (filePath: string) => void): void {
    for (const callbackParameter of callbackParameters) {
      callback(callbackParameter);
    }
  }
  const directoryIteratorStub: sinon.SinonStub = sinon.stub(directoryIterator, 'run');
  directoryIteratorStub.withArgs(withArgs, sinon.match.any).callsFake(stubFunction);

  return directoryIteratorStub;
}
