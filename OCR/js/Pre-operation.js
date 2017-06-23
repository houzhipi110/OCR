Promise = require('Bluebird');
var logger = require('../lib/bunyanLogger');
var gm = require('gm');
var fs = require("fs");
var copiedBuff = new Buffer(3000);

function mypreprocessing(imagedata) {
  return new Promise(function (resolve, reject) {
    var imagebuff = new Buffer(imagedata, 'base64');
    gm(imagebuff)
      .threshold(50, 1)//binariztion
      //deskew  
      //.autoOrient()
      //.crop(70,75,i*80+4,4)//ss
      //.resize(300, 300)//
      .toBuffer('PNG', function (err, processedBuffer) {
        if (!err) {
          //processedBuffer.copy(copiedBuff);
          console.log('image initial done');
          logger.logger('image initial done');
          resolve(processedBuffer);
        } else {
          console.log('image initial error');
          logger.logger('image initial done');
          reject(err);
        }
      });
  });
}

module.exports = { mypreprocessing: mypreprocessing };