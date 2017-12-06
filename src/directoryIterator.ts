/**
 * The DirectoryIterator module.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as file from './file';

/**
 * Executes the onFileCallback function for each file in the specified
 * directory and its subdirectories.
 * @param baseDirectory -  The directory in which the iterator will start.
 * @param onFileCallback - The function which will be executed for each file
 *                         in baseDirectory and its subdirectories.
 */
function run(baseDirectory: string, onFileCallback: (filePath: string) => void): void {
  const filesInDirectory: string[] = file.getFiles(baseDirectory);

  for (const filePath of filesInDirectory) {
    if (file.isDirectory(filePath)) {
      run(filePath, onFileCallback);
    } else {
      onFileCallback(filePath);
    }
  }
}

export {
  run
};
