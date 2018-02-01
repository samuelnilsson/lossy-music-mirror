/**
 * Tests for the audio module
 */

import { assert } from 'chai';
import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import * as path from 'path-extra';
import * as sinon from 'sinon';
import * as audio from './audio';
import * as file from './file';
import { CommandLineOptions } from './models/CommandLineOptions';

describe('audio', () => {
  let pathParseStub: sinon.SinonStub;
  let pathJoinStub: sinon.SinonStub;
  let spawnStub: sinon.SinonStub;
  let consoleInfoStub: sinon.SinonStub;
  let fsExistsStub: sinon.SinonStub;
  let fileGetExtensionStub: sinon.SinonStub;

  let validOptions: CommandLineOptions;

  describe('transcode', () => {
    beforeEach(() => {
      pathParseStub = sinon.stub(path, 'parse');
      pathJoinStub = sinon.stub(path, 'join');
      spawnStub = sinon.stub(spawn, 'sync');
      consoleInfoStub = sinon.stub(console, 'info');
      validOptions = new CommandLineOptions('any', 5, 'anyInput');
      fsExistsStub = sinon.stub(fs, 'existsSync');
    });

    afterEach(() => {
      if (pathParseStub != null) {
        pathParseStub.restore();
      }
      if (pathJoinStub != null) {
        pathJoinStub.restore();
      }
      if (spawnStub != null) {
        spawnStub.restore();
      }
      if (consoleInfoStub != null) {
        consoleInfoStub.restore();
      }
      if (fsExistsStub != null) {
        fsExistsStub.restore();
      }
    });

    it('should transcode the file into ogg using ffmpeg and the provided options', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      fsExistsStub.withArgs(`${outputDirectory}test.ogg`)
        .returns(false);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      const expectedOptions: string[] = [
        '-hide_banner',
        '-loglevel', 'error',
        '-i', '/any/test.flac',
        '-c:a', 'libvorbis',
        '-q:a', '5',
        '-vn',
        '/test/test.ogg'
      ];
      sinon.assert.calledOnce(spawnStub);
      sinon.assert.calledWith(spawnStub, 'ffmpeg', expectedOptions, { stdio: 'inherit' });
    });

    it('should log to the console which file is currently being transcoded', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      fsExistsStub.withArgs(`${outputDirectory}test.ogg`)
        .returns(false);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      const expectedOutput: string = 'Converting /any/test.flac to /test/test.ogg';
      sinon.assert.calledOnce(consoleInfoStub);
      sinon.assert.calledWith(consoleInfoStub, expectedOutput);
    });

    it('should log to the console before the transcoding starts', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      fsExistsStub.withArgs(`${outputDirectory}test.ogg`)
        .returns(false);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      sinon.assert.callOrder(consoleInfoStub, spawnStub);
    });

    it('should not transcode if the output file already exists', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      fsExistsStub.withArgs(`${outputDirectory}test.ogg`)
        .returns(true);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      sinon.assert.notCalled(spawnStub);
    });

    it('should print a message if the output file already exists', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      const output: string = `${outputDirectory}test.ogg`;
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(output);
      fsExistsStub.withArgs(output)
        .returns(true);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      const expected: string = `Skipping conversion to ${output} since it already exists`;
      sinon.assert.calledOnce(consoleInfoStub);
      sinon.assert.calledWith(consoleInfoStub, expected);
    });
  });

  describe('isLossless', () => {
    beforeEach(() => {
      fileGetExtensionStub = sinon.stub(file, 'getExtension');
    });

    afterEach(() => {
      if (fileGetExtensionStub != null) {
        fileGetExtensionStub.restore();
      }
    });

    it('should return true if the file extension is flac', () => {
      // Arrange
      const testFlacPath: string = '/any/file.flac';
      fileGetExtensionStub.withArgs(testFlacPath).returns('flac');

      // Act
      const result: boolean = audio.isLossless(testFlacPath);

      // Assert
      assert.isTrue(result);
    });

    it('should return false if file is not lossless', () => {
      // Arrange
      const testFlacPath: string = '/any/file.notlossless';
      fileGetExtensionStub.withArgs(testFlacPath).returns('notlossless');

      // Act
      const result: boolean = audio.isLossless(testFlacPath);

      // Assert
      assert.isFalse(result);
    });
  });
});
