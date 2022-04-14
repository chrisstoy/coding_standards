const walk = require('walk');
const path = require('path');
const fs = require('fs');
const os = require('os');
const readline = require('readline');

const matchers = [];
let walker;
let filesScanned = 0;
let returnCode = 0;

/**
 * Scan all .ts files in the /src folder to ensure they pass all rules
 */

matchers.push(
  {
    // Ensure no fdescribe/fit in spec files
    fileFilter: /.*spec.[jt]s/,
    regexp: /(?:fdescribe.?\(|fit.?\()/,
    message: 'Disallow fdescribe/fit',
  },
  {
    // disallow importing from /src
    regexp: /.*import.*from.*\/src.*/,
    message: 'Invalid import path starting with /src',
  },
  {
    // disallow deep imports from @xpo libraries
    regexp: /.*import.*@xpo.*\/lib\/.*/,
    message: 'Invalid import path deep linking into @xpo /lib',
  },
  {
    // disallow declaring variables of type `Boolean`
    regexp: /.*: Boolean[\,, ,;,\),\(].*/,
    message: 'Disallow variables of type `Boolean`. Use type `boolean` or !! if converting to a boolean',
  },
  {
    // disallow declaring variables of type `String`
    regexp: /.*: String[\,, ,;,\),\(].*/,
    message: 'Disallow variables of type `String`. Use type `string` or _toString if converting to a string',
  },
  {
    // disallow declaring variables of type `Number`
    regexp: /.*: Number[\,, ,;,\),\(].*/,
    message: 'Disallow variables of type `Number`. Use type `number` or _toNumber if converting to a number',
  },
  {
    // disallow changing tslint 'no-any' in non-spec files
    fileFilter: /^((?!spec).)*[tj]s$/,
    regexp: /(?:tslint\:).*disable(?!-next-line).*(?:\:no-any)/,
    message: 'Disallow changing tslint "no-any" rule in non-spec files',
  },
  {
    // disallow importing from main material module
    regexp: /import.*from.*'@angular\/material'/,
    message: 'Disallow import from material module',
  }
);

const options = {
  followLinks: true,
  // directories with these keys will be skipped
  filters: [],
};

const walkDir = function(dir) {
  walker = walk.walk(dir, options);
  walker.on('file', function(root, fileStats, next) {
    filesScanned++;
    if (fileStats.name.endsWith('ts')) {
      const filePath = `${root}${path.sep}${fileStats.name}`;
      // console.log(filePath);
      var rd = readline.createInterface({ input: fs.createReadStream(filePath) });
      let lineNumber = 0;
      rd.on('line', function(line) {
        lineNumber += 1;
        try {
          matchers.forEach((matcher) => {
            if (!matcher.fileFilter || matcher.fileFilter.test(filePath)) {
              if (matcher.regexp.test(line)) {
                const message = `${matcher.message} => ${filePath}:${lineNumber}`;
                process.stderr.write(`${message}${os.EOL}`);
                returnCode = 1;
              }
            }
          });
        } catch (err) {
          console.error(err);
        }
      });
    }
    next();
  });
  walker.on('errors', function(root, nodeStatsArray, next) {
    console.error('error while walking tree');
    next();
  });
  walker.on('end', function() {
    console.log(`finished walking tree.  Scanned: ${filesScanned} files`);
    process.exit(returnCode);
  });
};
const startDir = `${process.cwd()}${path.sep}src`;
console.log(`starting at: ${startDir}`);
walkDir(startDir);
