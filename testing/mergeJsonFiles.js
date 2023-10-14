const {merge} = require('mochawesome-merge');
const path = require('path');
const fs = require('fs');

const options = {
  files: [
    './mochawesome-report/parallel_chunk1_*/*.json',
    './mochawesome-report/parallel_chunk2_*/*.json',
    './mochawesome-report/parallel_chunk3_*/*.json',
    './mochawesome-report/parallel_chunk4_*/*.json',
  ],
  output: './mochawesome-report/output.json',
};

merge(options).then(
  (report) => {
    const content = JSON.stringify(report, null, 2);
    if (options.output) {
      const outputFilePath = path.resolve(process.cwd(), options.output);
      fs.mkdirSync(path.dirname(outputFilePath), {recursive: true});
      fs.writeFileSync(outputFilePath, content, {flag: 'w'});
      console.info(`Reports merged to ${outputFilePath}`);
    } else {
      process.stdout.write(content);
    }
  },
  (error) => {
    console.error('ERROR: Failed to merge reports\n');
    console.error(error);
  }
);
