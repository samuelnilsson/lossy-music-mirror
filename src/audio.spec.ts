/**
 * Tests for the audio module
 */

import { assert } from 'chai';
import * as childProcess from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path-extra';
import * as sinon from 'sinon';
import * as audio from './audio';
import * as file from './file';
import { Codec, CommandLineOptions } from './models/CommandLineOptions';

describe('audio', () => {
  let pathParseStub: sinon.SinonStub;
  let pathJoinStub: sinon.SinonStub;
  let childProcessStub: sinon.SinonStub;
  let consoleInfoStub: sinon.SinonStub;
  let fsExistsStub: sinon.SinonStub;
  let fileGetExtensionStub: sinon.SinonStub;

  let validOptions: CommandLineOptions;

  describe('transcode', () => {
    beforeEach(() => {
      pathParseStub = sinon.stub(path, 'parse');
      pathJoinStub = sinon.stub(path, 'join');
      childProcessStub = sinon.stub(childProcess, 'execSync');
      consoleInfoStub = sinon.stub(console, 'info');
      validOptions = new CommandLineOptions('any', 5, 'anyInput', Codec.Vorbis);
      fsExistsStub = sinon.stub(fs, 'existsSync');
    });

    afterEach(() => {
      if (pathParseStub != null) {
        pathParseStub.restore();
      }
      if (pathJoinStub != null) {
        pathJoinStub.restore();
      }
      if (childProcessStub != null) {
        childProcessStub.restore();
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
      const expectedCommand: string = 'ffmpeg -hide_banner -loglevel error -i "/any/test.flac" -c:a libvorbis -q:a 5 -vn "/test/test.ogg"';
      sinon.assert.calledOnce(childProcessStub);
      sinon.assert.calledWith(childProcessStub, expectedCommand);
    });

    it('should transcode the file into mp3 if that option is set', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.mp3')
        .returns(`${outputDirectory}test.mp3`);
      fsExistsStub.withArgs(`${outputDirectory}test.mp3`)
        .returns(false);
      validOptions.codec = Codec.Mp3;

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      const expectedCommand: string = 'ffmpeg -hide_banner -loglevel error -i "/any/test.flac" -c:a libmp3lame -q:a 5 -vn "/test/test.mp3"';
      sinon.assert.calledOnce(childProcessStub);
      sinon.assert.calledWith(childProcessStub, expectedCommand);
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
      sinon.assert.callOrder(consoleInfoStub, childProcessStub);
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
      sinon.assert.notCalled(childProcessStub);
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
