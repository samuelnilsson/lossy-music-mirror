/**
 * Tests for the audio module
 */

import { assert } from 'chai';
import { SpawnSyncReturns } from 'child_process';
import * as spawn from 'cross-spawn';
import * as fs from 'fs-extra';
import * as path from 'path-extra';
import * as sinon from 'sinon';
import * as audio from './audio';
import { Ape } from './models/Ape';
import { AppleLossless } from './models/AppleLossless';
import { ICodec } from './models/Codec.interface';
import { CommandLineOptions } from './models/CommandLineOptions';
import { Flac } from './models/Flac';
import { Mp3 } from './models/Mp3';
import { TrueAudio } from './models/TrueAudio';
import { Vorbis } from './models/Vorbis';
import { WavPack } from './models/WavPack';
import { WmaLossless } from './models/WmaLossless';

describe('audio', () => {
  let pathParseStub: sinon.SinonStub;
  let pathJoinStub: sinon.SinonStub;
  let spawnStub: sinon.SinonStub;
  let consoleInfoStub: sinon.SinonStub;
  let fsExistsStub: sinon.SinonStub;
  let getCodecStub: sinon.SinonStub;

  let validOptions: CommandLineOptions;

  beforeEach(() => {
    pathParseStub = sinon.stub(path, 'parse');
    pathJoinStub = sinon.stub(path, 'join');
    spawnStub = sinon.stub(spawn, 'sync');
    consoleInfoStub = sinon.stub(console, 'info');
    validOptions = new CommandLineOptions('any', 5, 'anyInput', new Vorbis());
    fsExistsStub = sinon.stub(fs, 'existsSync');
  });

  afterEach(() => {
    if (pathParseStub != null) {
      pathParseStub.restore();
    }
    if (pathJoinStub != null) {
      pathJoinStub.restore();
    }
    if (spawnStub != null) {
      spawnStub.restore();
    }
    if (consoleInfoStub != null) {
      consoleInfoStub.restore();
    }
    if (fsExistsStub != null) {
      fsExistsStub.restore();
    }
    if (getCodecStub != null) {
      getCodecStub.restore();
    }
  });

  describe('transcode', () => {
    it('should transcode the file into ogg using ffmpeg and the provided options', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      fsExistsStub.withArgs(`${outputDirectory}test.ogg`)
        .returns(false);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      const expectedOptions: string[] = [
        '-hide_banner',
        '-loglevel', 'error',
        '-i', '/any/test.flac',
        '-c:a', 'libvorbis',
        '-q:a', '5',
        '-vn',
        '/test/test.ogg'
      ];
      sinon.assert.calledOnce(spawnStub);
      sinon.assert.calledWith(spawnStub, 'ffmpeg', expectedOptions, { stdio: 'inherit' });
    });

    it('should transcode the file into mp3 if that option is set', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.mp3')
        .returns(`${outputDirectory}test.mp3`);
      fsExistsStub.withArgs(`${outputDirectory}test.mp3`)
        .returns(false);
      validOptions.codec = new Mp3();

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      const expectedOptions: string[] = [
        '-hide_banner',
        '-loglevel', 'error',
        '-i', '/any/test.flac',
        '-c:a', 'libmp3lame',
        '-q:a', '5',
        '-vn',
        '/test/test.mp3'
      ];
      sinon.assert.calledOnce(spawnStub);
      sinon.assert.calledWith(spawnStub, 'ffmpeg', expectedOptions);
    });

    it('should log to the console which file is currently being transcoded', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      fsExistsStub.withArgs(`${outputDirectory}test.ogg`)
        .returns(false);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      const expectedOutput: string = 'Converting /any/test.flac to /test/test.ogg';
      sinon.assert.calledOnce(consoleInfoStub);
      sinon.assert.calledWith(consoleInfoStub, expectedOutput);
    });

    it('should log to the console before the transcoding starts', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      fsExistsStub.withArgs(`${outputDirectory}test.ogg`)
        .returns(false);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      sinon.assert.callOrder(consoleInfoStub, spawnStub);
    });

    it('should not transcode if the output file already exists', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(`${outputDirectory}test.ogg`);
      fsExistsStub.withArgs(`${outputDirectory}test.ogg`)
        .returns(true);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      sinon.assert.notCalled(spawnStub);
    });

    it('should print a message if the output file already exists', () => {
      // Arrange
      const testFile: string = '/any/test.flac';
      const outputDirectory: string = '/test/';
      pathParseStub.withArgs(testFile).returns({
        name: 'test'
      });
      const output: string = `${outputDirectory}test.ogg`;
      pathJoinStub.withArgs(outputDirectory, 'test.ogg')
        .returns(output);
      fsExistsStub.withArgs(output)
        .returns(true);

      // Act
      audio.transcode(testFile, outputDirectory, validOptions);

      // Assert
      const expected: string = `Skipping conversion to ${output} since it already exists`;
      sinon.assert.calledOnce(consoleInfoStub);
      sinon.assert.calledWith(consoleInfoStub, expected);
    });
  });

  describe('isLossless', () => {
    beforeEach(() => {
      getCodecStub = sinon.stub(audio, 'getCodec');
    });

    it('should return true if the codec is flac', () => {
      // Arrange
      const testFlacPath: string = '/any/file.flac';
      getCodecStub.withArgs(testFlacPath).returns(new Flac());

      // Act
      const result: boolean = audio.isLossless(testFlacPath);

      // Assert
      assert.isTrue(result);
    });

    it('should return false if the codec is mp3', () => {
      // Arrange
      const testMp3Path: string = '/any/file.mp3';
      getCodecStub.withArgs(testMp3Path).returns(new Mp3());

      // Act
      const result: boolean = audio.isLossless(testMp3Path);

      // Assert
      assert.isFalse(result);
    });

    it('should return false if the codec is vorbis', () => {
      // Arrange
      const testVorbisPath: string = '/any/file.ogg';
      getCodecStub.withArgs(testVorbisPath).returns(new Vorbis());

      // Act
      const result: boolean = audio.isLossless(testVorbisPath);

      // Assert
      assert.isFalse(result);
    });

    it('should return null if the codec could not be determined', () => {
      // Arrange
      const testPath: string = '/any/file.nonsupported';
      getCodecStub.withArgs(testPath).returns(null);

      // Act
      const result: boolean = audio.isLossless(testPath);

      // Assert
      assert.isNull(result);
    });
  });

  describe('getCodec', () => {
    let defaultOptions: string[];

    beforeEach(() => {
      defaultOptions = [
        '-v', 'error',
        '-select_streams', 'a:0',
        '-show_entries', 'stream=codec_name',
        '-of', 'default=nokey=1:noprint_wrappers=1'
      ];
    });

    it('should return an instance of Mp3 if the codec is mp3', () => {
      // Arrange
      const testMp3Path: string = '/any/file.mp3';
      defaultOptions.push(testMp3Path);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from('mp3\n')
        });

      // Act
      const result: ICodec = audio.getCodec(testMp3Path);

      // Assert
      assert.isTrue(result instanceof Mp3);
    });

    it('should return an instance of Vorbis if the codec is vorbis', () => {
      // Arrange
      const testVorbisPath: string = '/any/file.ogg';
      defaultOptions.push(testVorbisPath);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from('vorbis\n')
        });

      // Act
      const result: ICodec = audio.getCodec(testVorbisPath);

      // Assert
      assert.isTrue(result instanceof Vorbis);
    });

    it('should return an instance of Flac if the codec is flac', () => {
      // Arrange
      const testFlacPath: string = '/any/file.flac';
      defaultOptions.push(testFlacPath);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from('flac\n')
        });

      // Act
      const result: ICodec = audio.getCodec(testFlacPath);

      // Assert
      assert.isTrue(result instanceof Flac);
    });

    it('should return an instance of Ape if the codec is ape', () => {
      // Arrange
      const testApePath: string = '/any/file.ape';
      defaultOptions.push(testApePath);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from('ape\n')
        });

      // Act
      const result: ICodec = audio.getCodec(testApePath);

      // Assert
      assert.isTrue(result instanceof Ape);
    });

    it('should return an instance of AppleLossless if the codec is apple lossless', () => {
      // Arrange
      const testALACPath: string = '/any/file.m4a';
      defaultOptions.push(testALACPath);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from('alac\n')
        });

      // Act
      const result: ICodec = audio.getCodec(testALACPath);

      // Assert
      assert.isTrue(result instanceof AppleLossless);
    });

    it('should return an instance of WmaLossless if the codec is wma lossless', () => {
      // Arrange
      const testWmaLosslessPath: string = '/any/file.wma';
      defaultOptions.push(testWmaLosslessPath);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from('wmalossless\n')
        });

      // Act
      const result: ICodec = audio.getCodec(testWmaLosslessPath);

      // Assert
      assert.isTrue(result instanceof WmaLossless);
    });

    it('should return an instance of WavPack if the codec is wavpack', () => {
      // Arrange
      const testWavPackPath: string = '/any/file.wv';
      defaultOptions.push(testWavPackPath);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from('wavpack\n')
        });

      // Act
      const result: ICodec = audio.getCodec(testWavPackPath);

      // Assert
      assert.isTrue(result instanceof WavPack);
    });

    it('should return an instance of TrueAudio if the codec is true audio', () => {
      // Arrange
      const testTrueAudioPath: string = '/any/file.tta';
      defaultOptions.push(testTrueAudioPath);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from('tta\n')
        });

      // Act
      const result: ICodec = audio.getCodec(testTrueAudioPath);

      // Assert
      assert.isTrue(result instanceof TrueAudio);
    });

    it('should return null if the exit status code is not 0', () => {
      // Arrange
      const testPath: string = '/any/file.any';
      defaultOptions.push(testPath);
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 1
        });

      // Act
      const result: ICodec = audio.getCodec(testPath);

      // Assert
      assert.isNull(result);
    });

    it('should return null if the codec is not supported', () => {
      // Arrange
      const testPath: string = '/any/file.any';
      defaultOptions.push(testPath);
      const unknownFFmpegCodecName: string = 'unsupported';
      spawnStub
        .withArgs('ffprobe', defaultOptions, { stdio: 'pipe' })
        .returns({
          status: 0,
          stdout: Buffer.from(`${unknownFFmpegCodecName}\n`)
        });

      // Act
      const result: ICodec = audio.getCodec(testPath);

      // Assert
      assert.isNull(result);
    });
  });
});
