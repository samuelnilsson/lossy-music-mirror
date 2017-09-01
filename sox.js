const { execSync } = require('child_process');
const path = require('path');

const transcode = (file) => {
  fileName = path.parse(file).name;
  const command = `sox "${file}" "${fileName}.ogg"`;
  execSync(command);
};

module.exports = {
  transcode
};
