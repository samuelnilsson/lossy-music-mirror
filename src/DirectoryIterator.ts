/**
 * The DirectoryIterator class.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as file from './file';

/**
 * Class representing a DirectoryIterator.
 */
export class DirectoryIterator {
  private baseDirectory: string;
  private onFileCallback: (filePath: string) => void;

  /**
   * Create a DirectoryIterator.
   * @param baseDirectory -  The directory in which the iterator will start.
   * @param onFileCallback - The function which will be executed for each file
   *                         in baseDirectory and its subdirectories.
   */
  constructor(baseDirectory: string, onFileCallback: (filePath: string) => void) {
    this.baseDirectory = file.getAbsolutePath(baseDirectory);
    this.onFileCallback = onFileCallback;
  }

  /**
   * Executes the onFileCallback function for each file in the baseDirectory
   * and its subdirectories.
   */
  public run(): void {
    this.iterateDirectory(this.baseDirectory);
  }

  /**
   * Executes the onFileCallback function for each file in the specified
   * directory and its subdirectories.
   * @param The directory in which the iterator will start.
   */
  private iterateDirectory(directoryPath: string): void {
    const filesInDirectory: string[] = file.getFiles(directoryPath);

    for (const filePath of filesInDirectory) {
      if (file.isDirectory(filePath)) {
        this.iterateDirectory(filePath);
      } else {
        this.onFileCallback(filePath);
      }
    }
  }
}
