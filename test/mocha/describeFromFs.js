
console.log("dirname", __dirname);
console.log("process.cwd()", process.cwd());

const path = require("path");
function describeFromFsRecursive(describeLabels, cb) {
  console.log("describeFromFsRecursive()", describeLabels);

  const label = describeLabels.shift();
  describe(label, function() {
    if (describeLabels.length > 0) {
      return describeFromFsRecursive(describeLabels, cb)
    }
    else {
      return cb();
    }
  })

}
function describeFromFs(dirname, cb) {
  console.log({dirname});
  const basePath = path.join(process.cwd(), "/test/mocha");
  const relativePath = path.relative(basePath, dirname)
  const describeLabels = relativePath.split("/");
  console.log({basePath, relativePath, dirname});
  return describeFromFsRecursive(describeLabels, cb);

}

module.exports = describeFromFs;
