var fs = require("fs");

var imagedata = base64convertor.encoder('./tests/manual.png');

//var covertbase64 = base64convertor.base64_fix('./tests/0_1.png');
fs.writeFile("./tests/covertbase64temp.txt", imagedata, 'utf8', function (err, data) {
    if (err) {
         console.log("failed");
    }
    else {
        console.log("succeed");
    }

});
