/**
 * The DirectoryIterator class.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { File } from './models/File';

/**
 * Class representing a DirectoryIterator.
 */
export class DirectoryIterator {
  private baseDirectory: string;
  private onFileCallback: (file: File) => void;

  /**
   * Create a DirectoryIterator.
   * @param baseDirectory -  The directory in which the iterator will start.
   * @param onFileCallback - The function which will be executed for each file
   *                         in baseDirectory and its subdirectories.
   */
  constructor(baseDirectory: string, onFileCallback: (file: File) => void) {
    this.baseDirectory = path.resolve(baseDirectory);
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
    const directory: File = new File(directoryPath);
    const filesInDirectory: File[] = directory.getFiles();

    for (const file of filesInDirectory) {
      if (file.isDirectory()) {
        this.iterateDirectory(file.getAbsolutePath());
      } else {
        this.onFileCallback(file);
      }
    }
  }
}
