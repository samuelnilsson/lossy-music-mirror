/**
 * Tests for the File class
 */

import { assert } from 'chai';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sinon from 'sinon';
import * as file from './file';

describe('File', () => {
  let pathStub: sinon.SinonStub;
  let fsStub: sinon.SinonStub;

  describe('getAbsolutePath', () => {
    it('should return the absolute path of the file', () => {
      // Arrange
      const relativePath: string = './test/test.any';
      const absolutePath: string = '/any/test/test.any';
      pathStub = sinon.stub(path, 'resolve');
      pathStub.withArgs(relativePath).returns(absolutePath);

      // Act
      const result: string = file.getAbsolutePath(relativePath);

      // Assert
      assert.equal(result, absolutePath);
    });
  });

  describe('isDirectory', () => {
    it('should return true if the File is a directory', () => {
      // Arrange
      const directoryPath: string = '/test/test';
      fsStub = sinon.stub(fs, 'lstatSync');
      fsStub.withArgs(directoryPath).returns({
        isDirectory: (): boolean => {
          return true;
        }
      });

      // Act
      const result: boolean = file.isDirectory(directoryPath);

      // Assert
      assert.isTrue(result);
    });

    it('should return false if the File is not a directory', () => {
      // Arrange
      const directoryPath: string = '/test/test.any';
      fsStub = sinon.stub(fs, 'lstatSync');
      fsStub.withArgs(directoryPath).returns({
        isDirectory: (): boolean => {
          return false;
        }
      });

      // Act
      const result: boolean = file.isDirectory(directoryPath);

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
      const result: string = file.getExtension(filePath);

      // Assert
      assert.equal(result, extension);
    });

    it('should return null if the file or directory has no extension', () => {
      // Arrange
      const directoryPath: string = '/test/test';

      // Act
      const result: string = file.getExtension(directoryPath);

      // Assert
      assert.isNull(result);
    });
  });

  describe('getDirectory', () => {
    it('should return the directory in which the file is', () => {
      // Arrange
      const directoryPath: string = '/any/test';
      const filePath: string = `${directoryPath}/test.any`;
      pathStub = sinon.stub(path, 'dirname');
      pathStub.withArgs(filePath).returns(directoryPath);

      // Act
      const result: string = file.getDirectory(filePath);

      // Assert
      assert.equal(result, directoryPath);
    });
  });

  describe('getFiles', () => {
    it('should return the files in the directory', () => {
      // Arrange
      const directoryPath: string = '/any/test';
      const resultFileNames: string[] = ['test.any', 'test2.any', 'test3.any'];
      fsStub = sinon.stub(fs, 'readdirSync');
      fsStub.withArgs(directoryPath).returns(resultFileNames);
      pathStub = sinon.stub(path, 'join');
      pathStub.withArgs(directoryPath, 'test.any').returns(`${directoryPath}/${resultFileNames[0]}`);
      pathStub.withArgs(directoryPath, 'test2.any').returns(`${directoryPath}/${resultFileNames[1]}`);
      pathStub.withArgs(directoryPath, 'test3.any').returns(`${directoryPath}/${resultFileNames[2]}`);

      // Act
      const result: string[] = file.getFiles(directoryPath);

      // Assert
      assert.deepEqual(result, [
        `${directoryPath}/${resultFileNames[0]}`,
        `${directoryPath}/${resultFileNames[1]}`,
        `${directoryPath}/${resultFileNames[2]}`
      ]);
    });
  });

  afterEach(() => {
    if (pathStub != null) {
      pathStub.restore();
    }
    if (fsStub != null) {
      fsStub.restore();
    }
  });
});
