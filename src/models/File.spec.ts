/**
 * Tests for the File class
 */

import { assert } from 'chai';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sinon from 'sinon';
import { File } from './File';

describe('File', () => {
  let pathStub: sinon.SinonStub;
  let pathResolveStub: sinon.SinonStub;
  let fsStub: sinon.SinonStub;

  describe('getAbsolutePath', () => {
    it('should return the absolute path of the file', () => {
      // Arrange
      const relativePath: string = './test/test.any';
      const absolutePath: string = '/any/test/test.any';
      pathStub = sinon.stub(path, 'resolve');
      pathStub.withArgs(relativePath).returns(absolutePath);

      // Act
      const file: File = new File(relativePath);
      const result: string = file.getAbsolutePath();

      // Assert
      assert.equal(result, absolutePath);
    });
  });

  describe('isDirectory', () => {
    it('should return true if the File is a directory', () => {
      // Arrange
      const directoryPath: string = '/test/test';
      const absoluteDirectoryPath: string = '/any/test';
      pathResolveStub = sinon.stub(path, 'resolve');
      pathResolveStub.withArgs(directoryPath).returns(absoluteDirectoryPath);
      fsStub = sinon.stub(fs, 'lstatSync');
      fsStub.withArgs(absoluteDirectoryPath).returns({
        isDirectory: (): boolean => {
          return true;
        }
      });

      // Act
      const file: File = new File(directoryPath);
      const result: boolean = file.isDirectory();

      // Assert
      assert.isTrue(result);
    });

    it('should return false if the File is not a directory', () => {
      // Arrange
      const directoryPath: string = '/test/test.any';
      const absoluteDirectoryPath: string = '/any/test';
      pathResolveStub = sinon.stub(path, 'resolve');
      pathResolveStub.withArgs(directoryPath).returns(absoluteDirectoryPath);
      fsStub = sinon.stub(fs, 'lstatSync');
      fsStub.withArgs(absoluteDirectoryPath).returns({
        isDirectory: (): boolean => {
          return false;
        }
      });

      // Act
      const file: File = new File(directoryPath);
      const result: boolean = file.isDirectory();

      // Assert
      assert.isFalse(result);
    });
  });

  describe('getExtension', () => {
    it('should return the extension of the file', () => {
      // Arrange
      const extension: string = 'any';
      const filePath: string = `/test/test.${extension}`;

      // Act
      const file: File = new File(filePath);
      const result: string = file.getExtension();

      // Assert
      assert.equal(result, extension);
    });

    it('should return null if the file or directory has no extension', () => {
      // Arrange
      const directoryPath: string = '/test/test';

      // Act
      const directory: File = new File(directoryPath);
      const result: string = directory.getExtension();

      // Assert
      assert.isNull(result);
    });
  });

  describe('getDirectory', () => {
    it('should return the directory in which the file is', () => {
      // Arrange
      const directoryPath: string = '/any/test';
      const filePath: string = `${directoryPath}/test.any`;
      const absoluteFilePath: string = '/any/any/test';
      pathResolveStub = sinon.stub(path, 'resolve');
      pathResolveStub.withArgs(filePath).returns(absoluteFilePath);
      pathStub = sinon.stub(path, 'dirname');
      pathStub.withArgs(absoluteFilePath).returns(directoryPath);

      // Act
      const file: File = new File(filePath);
      const result: string = file.getDirectory();

      // Assert
      assert.equal(result, directoryPath);
    });
  });

  describe('getFiles', () => {
    it('should return the files in the directory', () => {
      // Arrange
      const directoryPath: string = '/any/test';
      const resultFileNames: string[] = ['test.any', 'test2.any', 'test3.any'];
      const absoluteFilePath: string = '/any/any/test';
      pathResolveStub = sinon.stub(path, 'resolve');
      pathResolveStub.withArgs(directoryPath).returns(absoluteFilePath);
      fsStub = sinon.stub(fs, 'readdirSync');
      fsStub.withArgs(absoluteFilePath).returns(resultFileNames);

      // Act
      const directory: File = new File(directoryPath);
      const result: File[] = directory.getFiles();

      // Assert
      assert.deepEqual(result, [
        new File(`${directoryPath}/${resultFileNames[0]}`),
        new File(`${directoryPath}/${resultFileNames[1]}`),
        new File(`${directoryPath}/${resultFileNames[2]}`)
      ]);
    });
  });

  afterEach(() => {
    if (pathStub != null) {
      pathStub.restore();
    }
    if (pathResolveStub != null) {
      pathResolveStub.restore();
    }
    if (fsStub != null) {
      fsStub.restore();
    }
  });
});
