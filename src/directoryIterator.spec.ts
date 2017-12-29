/**
 * Tests for the directoryIterator module
 */

import { assert } from 'chai';
import * as sinon from 'sinon';
import * as directoryIterator from './directoryIterator';
import * as file from './file';

describe('directoryIterator', () => {
  describe('run', () => {
    let getFilesStub: sinon.SinonStub;
    let isDirectoryStub: sinon.SinonStub;

    beforeEach(() => {
      getFilesStub = sinon.stub(file, 'getFiles');
      isDirectoryStub = sinon.stub(file, 'isDirectory');
    });

    it('should execute the callback function for each file in the directory', () => {
      // Arrange
      getFilesStub.withArgs('/').returns([
        'directory1',
        'directory2',
        'file1'
      ]);

      getFilesStub.withArgs('directory1').returns([
        'file2',
        'file3'
      ]);

      getFilesStub.withArgs('directory2').returns([
        'file4',
        'directory3'
      ]);

      getFilesStub.withArgs('directory3').returns([
        'file5',
        'file6'
      ]);

      isDirectoryStub.withArgs('directory1').returns(true);
      isDirectoryStub.withArgs('directory2').returns(true);
      isDirectoryStub.withArgs('directory3').returns(true);
      isDirectoryStub.withArgs('file1').returns(false);
      isDirectoryStub.withArgs('file2').returns(false);
      isDirectoryStub.withArgs('file3').returns(false);
      isDirectoryStub.withArgs('file4').returns(false);
      isDirectoryStub.withArgs('file5').returns(false);

      // Act
      const onFileCallbackSpy: sinon.SinonSpy = sinon.spy();
      directoryIterator.run('/', onFileCallbackSpy);

      // Assert
      assert.equal(onFileCallbackSpy.callCount, 6);
      assert.isTrue(onFileCallbackSpy.withArgs('file1').calledOnce);
      assert.isTrue(onFileCallbackSpy.withArgs('file2').calledOnce);
      assert.isTrue(onFileCallbackSpy.withArgs('file3').calledOnce);
      assert.isTrue(onFileCallbackSpy.withArgs('file4').calledOnce);
      assert.isTrue(onFileCallbackSpy.withArgs('file5').calledOnce);
      assert.isTrue(onFileCallbackSpy.withArgs('file6').calledOnce);
    });

    afterEach(() => {
      if (getFilesStub != null) {
        getFilesStub.restore();
      }
      if (isDirectoryStub != null) {
        isDirectoryStub.restore();
      }
    });
  });
});
