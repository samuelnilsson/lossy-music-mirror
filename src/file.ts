/**
 * Contains functions that returns information about files and directories.
 */

import * as fs from 'fs-extra';
import * as path from 'path-extra';

const self: any = exports;

/**
 * Gets the absolute path to the file.
 * @param   The path to the file.
 * @returns The absolute path to the file.
 */
function getAbsolutePath(filePath: string): string {
  return path.resolve(filePath);
}

/**
 * Determines if the file is a directory.
 * @param   The path to the file or directory.
 * @returns True if the file is a directory and false otherwise.
 */
function isDirectory(filePath: string): boolean {
  return fs.lstatSync(filePath).isDirectory();
}

/**
 * Gets the extension of the file.
 * @returns The extension of the file or null if the file has no extension.
 */
function getExtension(filePath: string): string {
  const extension: string = path.extname(filePath).substr(1);

  return extension === '' ? null : extension;
}

/**
 * Gets the the directory where the file is.
 * @param   The path to the file.
 * @returns The directory where the file is.
 */
function getDirectory(filePath: string): string {
  return path.dirname(filePath);
  }

/**
 * Finds the files and directories in the directory.
 * @param   The path to the file.
 * @returns The paths to the files and directories in the directory.
 */
function getFiles(directoryPath: string): string[] {
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  const filenamesInPath: string[] = fs.readdirSync(directoryPath);

  return filenamesInPath.map<string>((filename: string) => {
    return path.join(directoryPath, filename);
  });
}

/**
 * Finds the relative path from filePathA to filePathB. If the path points to a
 * file, the file is ignored and instead the directory of the file is used.
 * @param   pathA The path to the first file or directory.
 * @param   pathB The path to the second file or directory.
 * @returns       The relative path from filePathA to filePathB.
 */
function getRelativePath(pathA: string, pathB: string): string {
  let directoryA: string = pathA;
  let directoryB: string = pathB;

  if (!self.isDirectory(directoryA)) {
    directoryA = self.getDirectory(directoryA);
  }
  if (!self.isDirectory(directoryB)) {
    directoryB = self.getDirectory(directoryB);
  }

  return path.relative(directoryA, directoryB);
}

/**
 * Creates the given directory.
 * @param The path to the directory to create.
 */
function createDirectory(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.ensureDirSync(directory);
  }
}

/**
 * Determines the file name of the file or directory specified in filePath.
 * @param   The path to the file or directory.
 * @returns The name of the file or directory specified in filePath.
 */
function getFilename(filePath: string): string {
  return path.parse(filePath).name;
}

/**
 * Deletes the files and directories in filePaths.
 * @param filePaths              The paths to the files and/or directories.
 * @param deleteEmptyDirectories Remove the directory of the file or directory
 *                               if it becomes empty after deletion.
 */
function deleteFiles(filePaths: string[], deleteEmptyDirectories: boolean = false): void {
  filePaths.forEach((f: string) => {
    if (fs.existsSync(f)) {
      fs.removeSync(f);
      if (deleteEmptyDirectories) {
        const directory: string = self.getDirectory(f);
        const directoryIsEmpty: boolean = fs.readdirSync(directory).length === 0;
        if (directoryIsEmpty) {
          self.deleteFiles([directory]);
        }
      }
    }
  });
}

/**
 * Finds the files in inDirectory that has the same filename as filename.
 * @param   inDirectory The directory in which to search.
 * @returns filename    The file or directory name to search for.
 */
function getFilesByFilename(inDirectory: string, filename: string): string[] {
  const result: string[] = [];

  const files: string[] = self.getFiles(inDirectory);
  files.forEach((f: string) => {
    if (self.getFilename(f) === filename) {
      result.push(f);
    }
  });

  return result;
}

export {
  getAbsolutePath,
  isDirectory,
  getExtension,
  getDirectory,
  getFiles,
  getRelativePath,
  createDirectory,
  getFilename,
  deleteFiles,
  getFilesByFilename
};
