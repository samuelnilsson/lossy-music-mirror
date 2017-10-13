/**
 * Tests for the sox module
 */

import { assert } from 'chai';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as sinon from 'sinon';
import * as ffmpeg from './ffmpeg';

describe('ffmpeg', () => {
  let pathParseStub: sinon.SinonStub;
  let pathJoinStub: sinon.SinonStub;
  let childProcessStub: sinon.SinonStub;
  let consoleInfoStub: sinon.SinonStub;

  describe('transcode', () => {
    it('should transcode the file into ogg using ffmpeg default options', () => {
      // Arrange
      const file: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(file).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);

      //Act
      ffmpeg.transcode(file, outputDirectory);

      // Assert
      const expectedCommand: string = 'ffmpeg -hide_banner -loglevel error -i "/any/test.flac" -c:a libvorbis "/test/test.ogg"';
      sinon.assert.calledOnce(childProcessStub);
      sinon.assert.calledWith(childProcessStub, expectedCommand);
    });

    it('should log to the console which file is currently being transcoded', () => {
      // Arrange
      const file: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(file).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);

      //Act
      ffmpeg.transcode(file, outputDirectory);

      // Assert
      const expectedOutput: string = 'Converting /any/test.flac to /test/test.ogg';
      sinon.assert.calledOnce(consoleInfoStub);
      sinon.assert.calledWith(consoleInfoStub, expectedOutput);
    });

    it('should log to the console before the transcoding starts', () => {
      // Arrange
      const file: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(file).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);

      //Act
      ffmpeg.transcode(file, outputDirectory);

      // Assert
      sinon.assert.callOrder(consoleInfoStub, childProcessStub);
    });
  });

  beforeEach(() => {
    pathParseStub = sinon.stub(path, 'parse');
    pathJoinStub = sinon.stub(path, 'join');
    childProcessStub = sinon.stub(childProcess, 'execSync');
    consoleInfoStub = sinon.stub(console, 'info');
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
  });
});
