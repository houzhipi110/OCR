var gm = require('gm');
Promise = require('Bluebird');
var logger = require('../lib/bunyanLogger');
var tesseract = require('node-tesseract');
var path = require('path');

var options = {
  l: 'eng',  //languguaasdasd
  psm: 6,
  'config': 'digits',
  binary: 'tesseract'
};

function split(imagedata, templatejson = '') {
  var z = [];
  for (var i = 0; i < 10; i++) {
    z.push(i);
  }
  return Promise.map(z, i => {
    return mysegmentation(imagedata, i).then(() => {
      console.log("splitting done");
    });
  });
}

function handelWholeTempalte(Obj) {
  var imagedata=Obj.processedImgBuff;
  var templatejson=Obj.templatejson;
  var objects = templatejson.blocks;
  if ("groupBlocks" in templatejson) {
    var groupblocks = templatejson.groupBlocks;
    groupblocks.forEach(function (element) {
      var groupid = element.groupId;
      var innerblocks = element.blocks;
      innerblocks.forEach(function (innerblock) {
        innerblock["groupId"] = groupid;
        objects.push(innerblock);
      }, this);
    }, this);
  }

  objects.forEach(function (object) {
    object["width"] = (object.bottomRightX - object.topLeftX) / object.cellNum;
    object["height"] = (object.bottomRightY - object.topLeftY);
    object.bottomRightX = parseFloat(object.bottomRightX);
    object.bottomRightY = parseFloat(object.bottomRightY);
    object.topLeftX = parseFloat(object.topLeftX);
    object.topLeftY = parseFloat(object.topLeftY);
    object.cellNum = parseFloat(object.cellNum);
  }, this);

  return Promise.map(objects, target => {
    return new Promise(function (resolve, reject) {
      handleSingleBlock(imagedata, target).then(pathes => {
        target["tempPathes"] = pathes;
        resolve(target);
      });
    });
  });
}

function handleSingleBlock(imagedata, object) {
  var z = [];
  for (var i = 0; i < object.cellNum; i++) {
    z.push(i);
  }
  return new Promise.map(z, i => {
    return mywholesegmentation(imagedata, object, i);
  });
}

function mysegmentation(imagedata, z) {
  return new Promise(function (resolve, reject) {
    //var bufferArray = [];
    //var errortag = false;
    //segment to 10 parts  
    //for (var i = 0; i < 10; i++) {
    //croptosegs(imagedata, gm, i);
    gm(imagedata)
      .crop(70, 75, z * 80 + 4, 4)//i * 80 + 4, 4)//segmentations parameters
      .resize(300, 300)//resize the picture to 300*300 
      //.operator('All','Threshold-White-Negate',200)
      //.toBuffer('PNG', function (err, processedBuffer) {
      .write(path.join('./js/temp', 'temp' + z + '.png'), function (err) {
        if (!err) {
          console.log('image segmentation done' + z);
          resolve();
        } else {
          console.log('image segmentation error' + z);
          reject();
        }
      });
  });
}

function mywholesegmentation(imagedata, object, z) {
  return new Promise(function (resolve, reject) {
    //var bufferArray = [];
    //var errortag = false;
    //segment to 10 parts  
    //for (var i = 0; i < 10; i++) {
    //croptosegs(imagedata, gm, i);
    var inputimage=__dirname+'/preoutput.jpg';
    var tempfilepath = path.join(__dirname+'/temp', object.blockId + '_' + 'temp' + z + '.png');
    //var tempfilepath ='c:/Users/502754585/Desktop/'+object.blockId + '_' + 'temp' + z + '.png';
    //tempfilepath='c:\Users\502754585\Desktop\new6192\MFGDigitalOCR\js\temp'+object.blockId + '_' + 'temp' + z + '.png';
    gm(inputimage)
      .crop(object.width - 0.30*object.width, 0.75*object.height, z * object.width + 0.1*object.width + object.topLeftX, object.topLeftY +0.05*object.height)//i * 80 + 4, 4)//segmentations parameters
      //.lat(object.width - 0.25*object.width, object.height - 0.2*object.height, 0,60)
      //.filter('Gaussian')
      .quality(100)
      //.enhance()
     //.operator('Black','Threshold-Black-Negate','50%')
     .resize(null, 300).threshold('50%')
      //resize the picture to 300*300 
      //.toBuffer('PNG', function (err, processedBuffer) {
      .write(tempfilepath, function (err) {
        if (!err) {
          console.log('image segmentation done' + object.blockId + '_' + 'temp' + z + '.png');
          resolve(tempfilepath);
        } else {
          console.log('image segmentation error' + object.blockId + '_' + 'temp' + z + '.png');
          console.log(err);
          reject(err);
        }
      });
  });
}

module.exports = {
  mysegmentation: split,
  mywholetempaltesplit: handelWholeTempalte
};