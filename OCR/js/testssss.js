var zeros = require("zeros")
var savePixels = require("save-pixels")
 var fs = require("fs");
//Create an image 
var x = zeros([32, 32])
x.set(16, 16, 255)
 
//Save to a file 
//savePixels(x, "jpg").pipe(writerStream);process.stdout
savePixels(x, "png").pipe(fs.createWriteStream('c:/Users/502754585/Desktop/houzi.jpg'));
console.log('执行完毕');
//console.log(stream);