var fs = require("fs");

var decoder = function base64_decoder(imagedata, outputfilename) {
  //var buff = imagedata.toString('base64').replace(/^data:image\/(png|gif|jpeg);base64,/,'');
  fs.writeFileSync(outputfilename, imagedata, function (err) {
    console.log(err);
  });
}

var encoder = function base64_encode(file) {
  // read binary data
  //var imagebase64data = fs.readFileSync(file, 'base64');
  return new Promise(function (resolve, reject) {
    fs.readFileSync(file, 'base64', function (err) {
      if (!err) {
        resolve()
      }
      else {
        reject(err)
      }
    });
  });
  //base64_fix(imagebase64data);
}


var base64_fix = function base64_fixing(file) {
  //pre operation base64 /= \/'
  var imagebase64data = fs.readFileSync(file, 'base64');
  var arr = imagebase64data;
  arr = imagebase64data.split('/');
  var afterFix = "";
  for (var i = 0; i < arr.length; i++) {
    afterFix += arr[i] + '\\/';
  }
  return afterFix;
}

module.exports = {
  encoder: encoder,
  decoder: decoder,
  base64_fix: base64_fix

};