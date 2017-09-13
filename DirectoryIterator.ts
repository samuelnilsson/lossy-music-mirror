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
   * Starts the iterator.
   */
  public run(): void {
    this.iterateDirectory(this.baseDirectory);
  }

  /**
   * Executes the onFileCallback function for each file in the specified
   * directory and its subdirectories.
   * @param The directory in which the iterator will start.
   */
  private iterateDirectory(directory: string): void {
    const filesInDirectory: File[] = this.getFilesInDirectory(directory);

    for (const file of filesInDirectory) {
      if (file.isDirectory()) {
        this.iterateDirectory(file.getAbsolutePath());
      } else {
        this.onFileCallback(file);
      }
    }
  }

  /**
   * Finds the files and directories in the specified directory.
   * @param   The directory in which to look for files.
   * @returns The files and directories in the specified directory.
   */
  private getFilesInDirectory(directory: string): File[] {
    const fileNamesInPath: string[] = fs.readdirSync(directory);

    return fileNamesInPath.map<File>((fileName: string) => {
      return new File(path.join(directory, fileName));
    });
  }
}
