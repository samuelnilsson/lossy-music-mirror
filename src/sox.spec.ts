/**
 * Tests for the sox module
 */

import { assert } from 'chai';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as sinon from 'sinon';
import * as sox from './sox';

describe('sox', () => {
  let pathParseStub: sinon.SinonStub;
  let pathJoinStub: sinon.SinonStub;
  let childProcessStub: sinon.SinonStub;

  describe('transcode', () => {
    it('should transcode the file into ogg using sox default options', () => {
      // Arrange
      const file: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub = sinon.stub(path, 'parse');
      pathParseStub.withArgs(file).returns({
        name: 'test'
      });
      pathJoinStub = sinon.stub(path, 'join');
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      childProcessStub = sinon.stub(childProcess, 'execSync');

      //Act
      sox.transcode(file, outputDirectory);

      // Assert
      const expectedCommand: string = 'sox "/any/test.flac" "/test/test.ogg"';
      sinon.assert.calledOnce(childProcessStub);
      sinon.assert.calledWith(childProcessStub, expectedCommand);
    });
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
  });
});
