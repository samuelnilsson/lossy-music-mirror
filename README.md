# lossy-music-mirror 
![build](https://api.travis-ci.org/samuelnilsson/lossy-music-mirror.svg?branch=master) ![coverage](https://coveralls.io/repos/github/samuelnilsson/lossy-music-mirror/badge.svg?branch=master)

Create a lossy mirror of your lossless music library.

## Usage

### Prerequisites
In order to use the package, node (tested with version 8 and higher), npm and [ffmpeg](https://www.ffmpeg.org) are required.

### Installation
The package is installed by issuing the following command:

```
npm install -g lossy-music-mirror
```

### Usage
For minimal usage the output path is required. Then the input directory will be the directory you are currently positioned in. For example, the following command will transcode every lossless file (of codec Flac, Ape, Apple lossless, WMA lossless, WavPack or TrueAudio) in the source directory (and its subdirectories) into vorbis and output the resulting files in ./output keeping the directory and file structure of the source:

```
lossy-music-mirror /home/output
```

All the available options are:

```
usage: lossy-music-mirror [-h] [-v] [-q QUALITY] [-i INPUT] output

Positional arguments:
  output                The output directory path

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -q QUALITY, --quality QUALITY
                        The vorbis quality (0-10 [default = 3])
  -i INPUT, --input INPUT
                        The input directory path [default = ./]
```

## Development
### Install dependencies
[node](https://nodejs.org) (at least version 8), npm and [ffmpeg](https://www.ffmpeg.org) are required. The remaining dependencies is installed by running

```
npm install
```

in the source directory.

### Build
The project is built by issuing:

```
npm run compile
```

### Running the tests
The following command will compile the project, run all the tests and display the resulting code coverage report:
```
npm test
```

## Contributing
If you find any issues, or have any feature suggestions, please add an issue on [github](https://github.com/samuelnilsson/lossy-music-mirror).

If you want to contribute to this repository, please make a pull request on the develop branch. In order to increase the chance that the pull request will be accepted, please see if the change is requested in the issue list and/or contact the repository owner before implementing the change.

## Authors
* **Samuel Nilsson** - *Initial work* - [samuelnilsson](https://github.com/samuelnilsson)


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
