/**
 * The File class.
 */

import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Class representing a File.
 */
export class File {
  private absolutePath: string;

  /**
   * Create a DirectoryIterator.
   * @param The relative or absolute path to the file.
   */
  constructor(filePath: string) {
    this.absolutePath = path.resolve(filePath);
  }

  /**
   * Gets the absolute path to the file.
   * @returns The absolute path to the file.
   */
  public getAbsolutePath(): string {
    return this.absolutePath;
  }

  /**
   * Determines if the file is a directory.
   * @returns True if the file is a directory and false otherwise.
   */
  public isDirectory(): boolean {
    return fs.lstatSync(this.absolutePath).isDirectory();
  }

  /**
   * Gets the extension of the file.
   * @returns The extension of the file or null if the file has no extension.
   */
  public getExtension(): string {
    const extension: string = path.extname(this.absolutePath).substr(1);

    return extension === '' ? null : extension;
  }

  /**
   * Gets the the directory where the file is.
   * @returns The directory where the file is.
   */
  public getDirectory(): string {
    return path.dirname(this.absolutePath);
  }
}
