/**
 * Tests for the File module
 */

import { assert } from 'chai';
import * as fs from 'fs-extra';
import * as path from 'path-extra';
import * as sinon from 'sinon';
import * as file from './file';

describe('file', () => {
  let sandbox: sinon.SinonSandbox;
  let pathStub: sinon.SinonStub;
  let fsExistsStub: sinon.SinonStub;
  let fsEnsureDirStub: sinon.SinonStub;
  let fsLstatStub: sinon.SinonStub;
  let fsReadDirStub: sinon.SinonStub;
  let fsRemoveSyncStub: sinon.SinonStub;
  let fileIsDirectoryStub: sinon.SinonStub;
  let fileGetDirectoryStub: sinon.SinonStub;
  let fileGetFileNameStub: sinon.SinonStub;
  let fileGetFilesStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fsExistsStub = sandbox.stub(fs, 'existsSync');
    fsEnsureDirStub = sandbox.stub(fs, 'ensureDirSync');
    fsLstatStub = sandbox.stub(fs, 'lstatSync');
    fsReadDirStub = sandbox.stub(fs, 'readdirSync');
    fsRemoveSyncStub = sandbox.stub(fs, 'removeSync');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getAbsolutePath', () => {
    it('should return the absolute path of the file', () => {
      // Arrange
      const relativePath: string = './test/test.any';
      const absolutePath: string = '/any/test/test.any';
      pathStub = sandbox.stub(path, 'resolve');
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
      fsLstatStub.withArgs(directoryPath).returns({
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
      fsLstatStub.withArgs(directoryPath).returns({
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
      pathStub = sandbox.stub(path, 'dirname');
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
      fsReadDirStub.withArgs(directoryPath).returns(resultFileNames);
      fsExistsStub.withArgs(directoryPath).returns(true);
      pathStub = sandbox.stub(path, 'join');
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

    it('should return empty if the directory is empty', () => {
      // Arrange
      const directoryPath: string = '/any/test';
      const resultFileNames: string[] = ['test.any', 'test2.any', 'test3.any'];
      fsReadDirStub.withArgs(directoryPath).returns(resultFileNames);
      fsExistsStub.withArgs(directoryPath).returns(false);
      pathStub = sandbox.stub(path, 'join');
      pathStub.withArgs(directoryPath, 'test.any').returns(`${directoryPath}/${resultFileNames[0]}`);
      pathStub.withArgs(directoryPath, 'test2.any').returns(`${directoryPath}/${resultFileNames[1]}`);
      pathStub.withArgs(directoryPath, 'test3.any').returns(`${directoryPath}/${resultFileNames[2]}`);

      // Act
      const result: string[] = file.getFiles(directoryPath);

      // Assert
      assert.deepEqual(result, []);
    });
  });

  describe('getRelativePath', () => {
    beforeEach(() => {
      fileIsDirectoryStub = sandbox.stub(file, 'isDirectory');
      fileIsDirectoryStub.withArgs('/any').returns(true);
      fileIsDirectoryStub.withArgs('/any2').returns(true);
      fileIsDirectoryStub.withArgs('/any/file.any').returns(false);
      fileIsDirectoryStub.withArgs('/any2/file2.any').returns(false);

      fileGetDirectoryStub = sandbox.stub(file, 'getDirectory');
      fileGetDirectoryStub.withArgs('/any/file.any').returns('/any');
      fileGetDirectoryStub.withArgs('/any2/file2.any').returns('/any2');

      pathStub = sandbox.stub(path, 'relative');
      pathStub.returns(null);
      pathStub.withArgs('/any', '/any2').returns('/any3');
    });

    it('should return the the relative path if the input are files', () => {
      // Act
      const result: string = file.getRelativePath('/any/file.any', '/any2/file2.any');

      // Assert
      assert.equal(result, '/any3');
    });

    it('should return the the relative path if the input are directories', () => {
      // Act
      const result: string = file.getRelativePath('/any', '/any2');

      // Assert
      assert.equal(result, '/any3');
    });

    it('should return the the relative path if the input are one file and one directory', () => {
      // Act
      const result: string = file.getRelativePath('/any/file.any', '/any2');
      const result2: string = file.getRelativePath('/any', '/any2/file2.any');

      // Assert
      assert.equal(result, '/any3');
      assert.equal(result2, '/any3');
    });
  });

  describe('createDirectory', () => {
    it('should create the given directory if it does not exist', () => {
      // Arrange
      const testDirectoryName: string = 'directoryName';
      fsExistsStub.returns(false);

      // Act
      file.createDirectory(testDirectoryName);

      // Assert
      assert.isTrue(fsEnsureDirStub.withArgs(testDirectoryName).calledOnce);
    });

    it('should not create the given directory if it does already exist', () => {
      // Arrange
      const testDirectoryName: string = 'directoryName';
      fsExistsStub.returns(true);

      // Act
      file.createDirectory(testDirectoryName);

      // Assert
      assert.isTrue(fsEnsureDirStub.notCalled);
    });
  });

  describe('getFilename', () => {
    it('should return the name of the file or directory', () => {
      // Arrange
      const testPath: string = '/any/name.ext';
      pathStub = sandbox.stub(path, 'parse');
      pathStub.withArgs(testPath).returns({
        name: 'name'
      });

      // Act
      const result: string = file.getFilename(testPath);

      // Assert
      assert.deepEqual(result, 'name');
    });
  });

  describe('deleteFiles', () => {
    beforeEach(() => {
      fileGetDirectoryStub = sandbox.stub(file, 'getDirectory');
      fileGetDirectoryStub.withArgs('/any/file').returns('/any');
      fileGetDirectoryStub.withArgs('/any/dir').returns('/any');
    });

    it('should delete the specified files and directories', () => {
      // Arrange
      fsExistsStub.withArgs('/any/file').returns(true);
      fsExistsStub.withArgs('/any/dir').returns(true);
      const testFiles: string[] = [
        '/any/file',
        '/any/dir'
      ];

      // Act
      file.deleteFiles(testFiles);

      // Assert
      assert.isTrue(fsRemoveSyncStub.withArgs(testFiles[0]).calledOnce);
      assert.isTrue(fsRemoveSyncStub.withArgs(testFiles[1]).calledOnce);
      assert.equal(fsRemoveSyncStub.callCount, 2);
    });

    it('should not attempt to delete the specified files and directories they do not exist', () => {
      // Arrange
      const testFiles: string[] = [
        '/any/file',
        '/any/dir'
      ];
      fsExistsStub.withArgs(testFiles[0]).returns(false);
      fsExistsStub.withArgs(testFiles[1]).returns(false);

      // Act
      file.deleteFiles(testFiles);

      // Assert
      assert.isTrue(fsRemoveSyncStub.notCalled);
    });

    it('should remove the directory of the specified files and directories if it becomes empty and deleteEmptyDirectories is true', () => {
      // Arrange
      const testFiles: string[] = [
        '/any/file',
        '/any/dir'
      ];
      const testDir: string = '/any';
      fsExistsStub.withArgs(testFiles[0]).returns(true);
      fsExistsStub.withArgs(testFiles[1]).returns(true);
      fsExistsStub.withArgs(testDir).returns(true);
      fileGetDirectoryStub.withArgs(testFiles[0]).returns(testDir);
      fileGetDirectoryStub.withArgs(testFiles[1]).returns(testDir);
      fsReadDirStub.withArgs(testDir).onCall(0).returns([testFiles[1]]);
      fsReadDirStub.withArgs(testDir).onCall(1).returns([]);

      // Act
      file.deleteFiles(testFiles, true);

      // Assert
      assert.isTrue(fsRemoveSyncStub.withArgs(testDir).calledOnce);
    });

    it('should not remove empty directories if they become empty and deleteEmptyDirectories is false', () => {
      // Arrange
      const testFiles: string[] = [
        '/any/file',
        '/any/dir'
      ];
      const testDir: string = '/any';
      fsExistsStub.withArgs(testFiles[0]).returns(true);
      fsExistsStub.withArgs(testFiles[1]).returns(true);
      fsExistsStub.withArgs(testDir).returns(true);
      fileGetDirectoryStub.withArgs(testFiles[0]).returns(testDir);
      fileGetDirectoryStub.withArgs(testFiles[1]).returns(testDir);
      fsReadDirStub.withArgs(testDir).onCall(0).returns([testFiles[1]]);
      fsReadDirStub.withArgs(testDir).onCall(1).returns([]);

      // Act
      file.deleteFiles(testFiles, false);

      // Assert
      assert.isFalse(fsRemoveSyncStub.withArgs(testDir).called);
    });
  });

  describe('getFilesByFilename', () => {
    it('should return the files in the directory that has the provided filename', () => {
      // Arrange
      const testDirectory: string = 'testdir';
      const testFilename: string = 'testname';
      const testDirectoryFiles: string[] = [
        'testname.a',
        'othername.b',
        'testname.c'
      ];

      fileGetFilesStub = sandbox.stub(file, 'getFiles');
      fileGetFilesStub.withArgs(testDirectory).returns(testDirectoryFiles);

      fileGetFileNameStub = sandbox.stub(file, 'getFilename');
      fileGetFileNameStub.withArgs(testDirectoryFiles[0]).returns(testFilename);
      fileGetFileNameStub.withArgs(testDirectoryFiles[1]).returns('othername');
      fileGetFileNameStub.withArgs(testDirectoryFiles[2]).returns(testFilename);

      // Act
      const result: string[] = file.getFilesByFilename(testDirectory, testFilename);

      // Assert
      assert.deepEqual(result, [
        'testname.a',
        'testname.c'
      ]);
    });
  });
});
