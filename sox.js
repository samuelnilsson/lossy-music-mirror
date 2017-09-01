const { execSync } = require('child_process');
const path = require('path');

const transcode = (file, outputDirectory) => {
  fileName = path.parse(file).name;
  const command = `sox "${file}" "${outputDirectory}/${fileName}.ogg"`;
  execSync(command);
};

module.exports = {
  transcode
};
