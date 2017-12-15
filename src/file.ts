/**
 * Contains functions that returns information about files and directories.
 */

import * as fs from 'fs-extra';
import * as path from 'path';

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
  const fileNamesInPath: string[] = fs.readdirSync(directoryPath);

  return fileNamesInPath.map<string>((fileName: string) => {
    return path.join(directoryPath, fileName);
  });
}

export {
  getAbsolutePath,
  isDirectory,
  getExtension,
  getDirectory,
  getFiles
};
