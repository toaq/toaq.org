// Parse STDIN and output as JSON to STDOUT.
var fs = require('fs');
require("./toaqlanguage.js");
console.log(JSON.stringify(camxes.parse(fs.readFileSync(0, 'utf-8'))));
