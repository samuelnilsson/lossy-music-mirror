/**
 * Tests for the app module
 */

import { assert } from 'chai';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import { Question } from 'inquirer';
import * as path from 'path';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStub } from 'sinon';
import * as app from './app';
import * as audio from './audio';
import * as commandLineInputParser from './commandLineInputParser';
import * as directoryIterator from './directoryIterator';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';
import { Mp3 } from './models/Mp3';
import { Vorbis } from './models/Vorbis';

describe('app', () => {
  let sandbox: SinonSandbox;
  let directoryIteratorStub: SinonStub;
  let audioTranscodeStub: SinonStub;
  let audioIsLosslessStub: SinonStub;
  let pathJoinStub: SinonStub;
  let fileGetRelativePathStub: SinonStub;
  let fileCreateDirectoryStub: SinonStub;
  let commandLineInputParserValidateStub: SinonStub;
  let consoleInfoStub: SinonStub;
  let getFilesToDeleteStub: SinonStub;
  let fileDeleteFilesStub: SinonStub;
  let startTranscodeStub: SinonStub;
  let askUserForDeleteStub: SinonStub;
  let processStdoutStub: SinonStub;
  let fileGetFilesByFileNameStub: SinonStub;
  let fileGetFileNameStub: SinonStub;
  let audioGetCodecStub: SinonStub;
  let audioIsSameCodecStub: SinonStub;
  let fsExistsSyncStub: SinonStub;
  let countNumberOfLosslessFilesStub: SinonStub;
  let inquirerPromptStub: SinonStub;

  let testData: string[];
  let options: CommandLineOptions;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    audioTranscodeStub = sandbox.stub(audio, 'transcode');
    audioIsLosslessStub = sandbox.stub(audio, 'isLossless');
    pathJoinStub = sandbox.stub(path, 'join');
    fileGetRelativePathStub = sandbox.stub(file, 'getRelativePath');
    fileCreateDirectoryStub = sandbox.stub(file, 'createDirectory');
    commandLineInputParserValidateStub = sandbox.stub(commandLineInputParser, 'validate');
    consoleInfoStub = sandbox.stub(console, 'info');
    fileDeleteFilesStub = sandbox.stub(file, 'deleteFiles');
    fileGetFilesByFileNameStub = sandbox.stub(file, 'getFilesByFilename');
    fileGetFileNameStub = sandbox.stub(file, 'getFilename');
    audioGetCodecStub = sandbox.stub(audio, 'getCodec');
    audioIsSameCodecStub = sandbox.stub(audio, 'isSameCodec');
    fsExistsSyncStub = sandbox.stub(fs, 'existsSync');
    inquirerPromptStub = sandbox.stub(inquirer, 'prompt');
  });

  describe('run', () => {
    let filesToDeleteTestResponse: string[];

    beforeEach(() => {
      startTranscodeStub = sandbox.stub(app, 'startTranscode');
      getFilesToDeleteStub = sandbox.stub(app, 'getFilesToDelete');
      askUserForDeleteStub = sandbox.stub(app, 'askUserForDelete');

      options = new CommandLineOptions('outputDir', 3, 'inputDir', new Vorbis(), false);
      commandLineInputParserValidateStub.withArgs(options).returns(true);

      filesToDeleteTestResponse = [
        'fileToDelete1',
        'fileToDelete2'
      ];
      getFilesToDeleteStub
        .withArgs(options.input, options.output, options.codec)
        .returns(filesToDeleteTestResponse);
      askUserForDeleteStub.withArgs(filesToDeleteTestResponse).resolves(true);
    });

    it('should validate the options', async () => {
      // Act
      await app.run(options);

      // Assert
      assert.isTrue(consoleInfoStub.withArgs('Validation failed.').notCalled);
    });

    it('should print a validation failure message and exit if options validation fails', async () => {
      // Arrange
      commandLineInputParserValidateStub.withArgs(options).returns(false);

      // Act
      await app.run(options);

      // Assert
      assert.isTrue(consoleInfoStub.calledWith('Validation failed.'));
      assert.isTrue(consoleInfoStub.calledOnce);
      assert.isTrue(fileDeleteFilesStub.notCalled);
      assert.isTrue(startTranscodeStub.notCalled);
    });

    it('should not ask for delete or delete any files if the delete flag is set to false', async () => {
      // Act
      await app.run(options);

      // Assert
      assert.isTrue(getFilesToDeleteStub.notCalled);
      assert.isTrue(askUserForDeleteStub.notCalled);
      assert.isTrue(fileDeleteFilesStub.notCalled);
    });

    it('should ask the user before deleting files', async () => {
      // Arrange
      askUserForDeleteStub.withArgs(filesToDeleteTestResponse).resolves(true);

      // Act
      await app.run(options);

      // Assert
      assert.isTrue(consoleInfoStub.withArgs('Exiting.').notCalled);
    });

    it('should print an exit message and exit if the user denies deleting files', async () => {
      // Arrange
      options.deleteFiles = true;
      askUserForDeleteStub.withArgs(filesToDeleteTestResponse).resolves(false);

      // Act
      await app.run(options);

      // Assert
      assert.isTrue(consoleInfoStub.calledWith('Exiting.'));
      assert.isTrue(consoleInfoStub.calledOnce);
      assert.isTrue(fileDeleteFilesStub.notCalled);
      assert.isTrue(startTranscodeStub.notCalled);
    });

    it('should delete files returned by getFilesToDelete', async () => {
      // Act
      options.deleteFiles = true;
      await app.run(options);

      // Assert
      assert.isTrue(fileDeleteFilesStub.calledOnce);
      assert.isTrue(fileDeleteFilesStub.calledWithExactly(filesToDeleteTestResponse));
    });

    it('should start the transcoding', async () => {
      // Act
      await app.run(options);

      // Assert
      assert.isTrue(startTranscodeStub.calledOnce);
    });

    it('should delete the files before transcoding', async () => {
      // Act
      options.deleteFiles = true;
      await app.run(options);

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

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory, sandbox);

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

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory, sandbox);

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

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory, sandbox);

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

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory, sandbox);

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

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory, sandbox);

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

      directoryIteratorStub = createDirectoryIteratorStub(testData, testOutputDirectory, sandbox);

      // Act
      const result: string[] = app.getFilesToDelete(testInputDirectory, testOutputDirectory, testOutputCodec);

      // Assert
      assert.deepEqual(result, []);
    });
  });

  describe('startTranscode', () => {
    beforeEach(() => {
      processStdoutStub = sandbox.stub(process.stdout, 'write');
      countNumberOfLosslessFilesStub = sandbox.stub(app, 'countNumberOfLosslessFiles');
      countNumberOfLosslessFilesStub.withArgs('inputDir').returns(2);

      options = new CommandLineOptions('outputDir', 3, 'inputDir', new Vorbis(), false);
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

      directoryIteratorStub = createDirectoryIteratorStub(testData, 'inputDir', sandbox);
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

      directoryIteratorStub = createDirectoryIteratorStub(testData, 'inputDir', sandbox);
    });

    it('should return the correct number of lossless files', () => {
      // Act
      const result: number = app.countNumberOfLosslessFiles('inputDir');

      // Assert
      assert.deepEqual(result, 2);
    });
  });

  describe('askUserForDelete', () => {
    let testFiles: string[];

    beforeEach(() => {
      testFiles = [
        'testFile1',
        'testFile2'
      ];

      inquirerPromptStub.resolves({
        confirmDelete: null
      });
    });

    it('should print the files to the console', async () => {
      // Act
      await app.askUserForDelete(testFiles);

      // Assert
      assert.isTrue(consoleInfoStub.withArgs(testFiles[0]).calledOnce);
      assert.isTrue(consoleInfoStub.withArgs(testFiles[1]).calledOnce);
      assert.isTrue(consoleInfoStub.withArgs(testFiles[0])
        .calledBefore(consoleInfoStub.withArgs(testFiles[1])));
    });

    it('should ask the user for confirmation', async () => {
      // Arrange
      const expectedQuestion: Question = {
        type: 'confirm',
        name: 'confirmDelete',
        message: 'The files listed above will be deleted. Are you sure you want to continue?'
      };

      // Act
      await app.askUserForDelete(testFiles);

      // Assert
      assert.isTrue(inquirerPromptStub.withArgs(expectedQuestion).calledOnce);
      assert.isTrue(consoleInfoStub.calledBefore(inquirerPromptStub));
    });

    it('should return true with no question if there are no files to delete', async () => {
      // Arrange
      const result: boolean = await app.askUserForDelete([]);

      // Assert
      assert.isFalse(inquirerPromptStub.called);
      assert.isTrue(result);
    });

    it('should return true if the user confirms', async () => {
      // Arrange
      const response: inquirer.Answers = {};
      /* tslint:disable:no-string-literal */
      response['confirmDelete'] = true;
      /* tslint:enable:no-string-literal */
      inquirerPromptStub.resolves(response);

      // Act
      const result: boolean = await app.askUserForDelete(testFiles);

      // Assert
      assert.isTrue(result);
    });

    it('should return false if the user rejects', async () => {
      // Arrange
      const response: inquirer.Answers = {};
      /* tslint:disable:no-string-literal */
      response['confirmDelete'] = false;
      /* tslint:enable:no-string-literal */
      inquirerPromptStub.resolves(response);

      // Act
      const result: boolean = await app.askUserForDelete(testFiles);

      // Assert
      assert.isFalse(result);
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
});

function createDirectoryIteratorStub(callbackParameters: string[], withArgs: string, sandbox: SinonSandbox): SinonStub {
  function stubFunction(input: string, callback: (filePath: string) => void): void {
    for (const callbackParameter of callbackParameters) {
      callback(callbackParameter);
    }
  }
  const directoryIteratorStub: SinonStub = sandbox.stub(directoryIterator, 'run');
  directoryIteratorStub.withArgs(withArgs, sinon.match.any).callsFake(stubFunction);

  return directoryIteratorStub;
}
