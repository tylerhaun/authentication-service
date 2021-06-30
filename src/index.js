require("@babel/register")({extensions: ['.js', '.ts']})
require("@babel/polyfill");
const ret = require("./server.js");
module.exports = ret;
