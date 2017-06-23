Promise = require('Bluebird');
var gm = require('gm');
var fs = require("fs");
var getPixels = require("get-pixels");

global.original_width;
global.original_height;
//global.imagedataPath;
global.imagedataPath;//= __dirname + "/testtemplate001.jpg";
//var imagedatapath=__dirname + "/testtemplate001.jpg";
//imagedataPath= __dirname + "/testtemplate001.jpg";
//pre_total(imagedatapath).then(value=>{console.log('okokokok')});
//main function 

function image_copy(imagedatapath,newimagedatapath){
  fs.writeFileSync(newimagedatapath, fs.readFileSync(imagedatapath));

}

function pre_total(imagedatapath) {
  var newimagedatapath=__dirname+'/preoutput.jpg';
  image_copy(imagedatapath,newimagedatapath);
 var imagedataPath = newimagedatapath;
  return new Promise(function (resolve, reject) {
    //recognizied image size like 2368*1695
    Recog_Size(imagedataPath).then(value => {
      original_width = value.width;
      original_height = value.height;
      console.log("value.height=" + value.height);
      return value;
    }).then(value => {
      //if image width <height to rotate  90 degree
      image_horizon(value,imagedataPath)
        .then(value => {
          //find black blocks 1 if not exist then rotate 180 
          Scan_point1(imagedataPath)
            .then(lower_right_xy => {
              image_rotate180(lower_right_xy,imagedataPath)
                .then(() => {
                  Scan_point1(imagedataPath)
                    .then(lower_right_xy => {
                      var lower_right_stack = [];
                      lower_right_stack.push(lower_right_xy);
                      //var temp1 = original_width;
                      //find top right black blocks 
                      Scan_point2(original_width, imagedataPath)
                        .then(lower_right_xy2 => {
                          lower_right_stack.push(lower_right_xy2);
                          return lower_right_stack;
                        })
                        .then(lower_right_stack => {
                          //gradient
                          var K_gradient = -(lower_right_stack[1][1] - lower_right_stack[0][1]) / (lower_right_stack[1][0] - lower_right_stack[0][0]);
                          var angle = Math.atan(K_gradient) * 180 / (Math.PI);
                          var DataObj = new Object();
                          DataObj.angle = angle;
                          DataObj.cropxy = lower_right_stack;
                          return DataObj;
                        })
                        .then(DataObj => {
                          // based angle to deskew
                          image_rotate(DataObj,imagedataPath)
                            .then(() => {
                              Scan_point1(imagedataPath)
                                .then((lower_right_xy) => {
                                  image_crop(lower_right_xy,imagedataPath)
                                    .then(processedBuffer => {
                                      console.log('pre is all done');
                                      if (processedBuffer != null) {
                                        totaldata = processedBuffer;
                                        resolve(processedBuffer);
                                      }
                                      else {
                                        reject(err);
                                      }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
  });
}

function Recog_Size(imagedataPath) {
  return new Promise(function (resolve, reject) {
    gm(imagedataPath)
      .size(function (err, value) {
        if (!err) {
          console.log('image size recog done');
          console.log("value.width=" + value.width);
          resolve(value);
        } else {
          console.log('image size recog error' + err);
          reject(err);
        }
      });
  });
}

function image_rotate180(lower_right_xy,imagedataPath) {
  return new Promise(function (resolve, reject) {
    if (lower_right_xy[0] == -1 | lower_right_xy[1] == -1) {
      console.log('please rotate 180');
      gm(imagedataPath)
        .rotate('white', 180)
        .quality(100)
        .write(imagedataPath, function (err) {
          if (!err) {
            console.log('image rotate 180 done');
            resolve(lower_right_xy);
          } else {
            console.log('image rotate 180 error');
            reject(err);
          }
        });
    }else{
      resolve(lower_right_xy);
    }
   // resolve(lower_right_xy);
  });
}

function image_horizon(value,imagedataPath) {
  return new Promise(function (resolve, reject) {
    if (value.width < value.height) {
      original_width = value.height;
      original_height = value.width;
      gm(imagedataPath)
        //.threshold(80, 1)
        .rotate('white', 90)
        .quality(100)
        .write(imagedataPath, function (err) {
          if (!err) { console.log('rotate90 done');
        resolve(value); }
          else { reject(err); }
        });
    }
    else {
      gm(imagedataPath)
        //.threshold(80, 1)
        .quality(100)
        .write(imagedataPath, function (err) {
          if (!err) { console.log('binarization done');
        resolve(value); }
          else { reject(err); }
        });
    }
    //resolve(value);
  });
}

function Scan_point1(imagedataPath) {
  return new Promise(function (resolve, reject) {
    //   api parameters:   
    //		input:		  path of img :							imgpath (default: )
    //					  the black block length:				Flag_black_length;   (default:24)
    //					  the range of coodinate  to scan:		Range_scan;  (default:100 mean:100*100)
    //		output:		   pixel position:						lower_right_xy = [lower_right_x ,lower_right_y];
    var lower_right_x;
    var lower_right_y;
    var lower_right_xy = [];
    getPixels(imagedataPath, function (err, pixels) {
      if (err) {
        console.log("Bad image path");
        reject(err);
        return
      }
      var pixelMatrix = new Array();
      for (var i = 0; i < 100; i++) {
        pixelMatrix[i] = new Array();
        for (var j = 0; j < 100; j++) {
          pixelMatrix[i][j] = pixels.get(i, j, 0);//
        }
      }
      var left_top_x = -1;
      var left_top_y = -1;
      for (var i = 0; i < 95; i++) {
        for (var j = 0; j < 95; j++) {
          if (pixelMatrix[i][j] <= 50) {
            if ((pixelMatrix[i][j + 1] + pixelMatrix[i][j + 2] + pixelMatrix[i][j + 3] + pixelMatrix[i][j + 4] + pixelMatrix[i][j + 5] <= 255) &&
              (pixelMatrix[i + 1][j + 1] + pixelMatrix[i + 1][j + 2] + pixelMatrix[i + 1][j + 3] + pixelMatrix[i + 1][j + 4] + pixelMatrix[i + 1][j + 5] <= 255) &&
              (pixelMatrix[i + 2][j + 1] + pixelMatrix[i + 2][j + 2] + pixelMatrix[i + 2][j + 3] + pixelMatrix[i + 2][j + 4] + pixelMatrix[i + 2][j + 5] <= 255)
            ) {
              left_top_x = i;
              break;
            }
          }
        }
        if (left_top_x != -1) {
          break;
        }
      }

      for (var j = 0; j < 95; j++) {
        for (var i = 0; i < 95; i++) {
          if (pixelMatrix[i][j] <= 50) {
            if ((pixelMatrix[i + 1][j] + pixelMatrix[i + 2][j] + pixelMatrix[i + 3][j] + pixelMatrix[i + 4][j] + pixelMatrix[i + 5][j] <= 255) &&
              (pixelMatrix[i + 1][j + 1] + pixelMatrix[i + 2][j + 1] + pixelMatrix[i + 3][j + 1] + pixelMatrix[i + 4][j + 1] + pixelMatrix[i + 5][j + 1] <= 255) &&
              (pixelMatrix[i + 1][j + 2] + pixelMatrix[i + 2][j + 2] + pixelMatrix[i + 3][j + 2] + pixelMatrix[i + 4][j + 2] + pixelMatrix[i + 5][j + 2] <= 255) &&
              (pixelMatrix[i + 1][j + 3] + pixelMatrix[i + 2][j + 3] + pixelMatrix[i + 3][j + 3] + pixelMatrix[i + 4][j + 3] + pixelMatrix[i + 5][j + 2] <= 255)
            ) {
              left_top_y = j;
              break;
            }
          }
        }
        if (left_top_y != -1) {
          break;
        }
      }
      if (left_top_x == -1 | left_top_y == -1) {
        console.log('Do not find point1');
        lower_right_xy.push(-1);
        lower_right_xy.push(-1);
        resolve(lower_right_xy);
      }
      else {
        lower_right_x = left_top_x + 15;
        lower_right_y = left_top_y + 15;
        lower_right_xy.push(lower_right_x);
        lower_right_xy.push(lower_right_y);
        console.log('lower_right_x:' + lower_right_x + '  lower_right_y:' + lower_right_y);
        resolve(lower_right_xy);
      }
    });
  });
}

function image_rotate(DataObj,imagedataPath) {
  return new Promise(function (resolve, reject) {
    gm(imagedataPath)
      //.threshold(50, 1)//binariztion
      .rotate('white', DataObj.angle)
      .quality(100)
      //.toBuffer('PNG', function (err, processedBuffer) {
      .write(imagedataPath, function (err) {
        if (!err) {
          //processedBuffer.copy(copiedBuff);
          console.log('image deskew done');
          resolve('ok done');
        } else {
          console.log('image deskew error');
          reject('image initial error');
        }
      });
  });

}

function image_crop(lower_right_xy,imagedataPath) {
  return new Promise(function (resolve, reject) {
    gm(imagedataPath)
      //.threshold(50, 1)
       //.threshold(80, 1)
      //binariztion
      .crop(2215, 1525, lower_right_xy[0], lower_right_xy[1])
      .quality(100)
      //.toBuffer('PNG', function (err, processedBuffer) {
      .write(imagedataPath, function (err) {
        if (!err) {
          console.log('image initial tolally done');
          resolve(imagedataPath);
        } else {
          console.log('image initial error');
          reject('image initial error');
        }
      });
  });

}

//according original_width to find last 100 pixels
function Scan_point2(original_width,imagedataPath) {
  return new Promise(function (resolve, reject) {

    //   api parameters:   
    //		input:		  path of img :							imgpath (default: 'gray.jpg')
    //					  the black block length:				Flag_black_length;   (default:27)
    //					  the range of coodinate  to scan:		Range_scan;  (default:100 mean:100*100)
    //		output:		   pixel position:				lower_right_xy = [lower_right_x ,lower_right_y];		
    var lower_right_x;
    var lower_right_y;
    var lower_right_xy = [];
    getPixels(imagedataPath, function (err, pixels) {
      if (err) {
        console.log("Bad image path");
        reject(err);
        return
      }
      var pixelMatrix = new Array();
      for (var i = 0; i < 120; i++) {
        pixelMatrix[i] = new Array();
        for (var j = 0; j < 120; j++) {
          pixelMatrix[i][j] = pixels.get(original_width - 100 + i, j, 0);//
        }
      }
      var left_top_x = -1;
      var left_top_y = -1;
      for (var i = 0; i < 120; i++) {
        for (var j = 0; j < 120; j++) {
          if (pixelMatrix[i][j] <= 50) {
            if ((pixelMatrix[i][j + 1] + pixelMatrix[i][j + 2] + pixelMatrix[i][j + 3] + pixelMatrix[i][j + 4] + pixelMatrix[i][j + 5] <= 400) &&
              (pixelMatrix[i + 1][j + 1] + pixelMatrix[i + 1][j + 2] + pixelMatrix[i + 1][j + 3] + pixelMatrix[i + 1][j + 4] + pixelMatrix[i + 1][j + 5] <= 400) &&
              (pixelMatrix[i + 2][j + 1] + pixelMatrix[i + 2][j + 2] + pixelMatrix[i + 2][j + 3] + pixelMatrix[i + 2][j + 4] + pixelMatrix[i + 2][j + 5] <= 400)
            ) {
              left_top_x = i;
              break;
            }

          }

        }
        if (left_top_x != -1) {
          break;
        }

      }
      for (var j = 0; j < 120; j++) {
        for (var i = 0; i < 120; i++) {
          if (pixelMatrix[i][j] <= 50) {
            if ((pixelMatrix[i + 1][j] + pixelMatrix[i + 2][j] + pixelMatrix[i + 3][j] + pixelMatrix[i + 4][j] + pixelMatrix[i + 5][j] <= 500) &&
              (pixelMatrix[i + 1][j + 1] + pixelMatrix[i + 2][j + 1] + pixelMatrix[i + 3][j + 1] + pixelMatrix[i + 4][j + 1] + pixelMatrix[i + 5][j + 1] <= 500) &&
              (pixelMatrix[i + 1][j + 2] + pixelMatrix[i + 2][j + 2] + pixelMatrix[i + 3][j + 2] + pixelMatrix[i + 4][j + 2] + pixelMatrix[i + 5][j + 2] <= 500) &&
              (pixelMatrix[i + 1][j + 3] + pixelMatrix[i + 2][j + 3] + pixelMatrix[i + 3][j + 3] + pixelMatrix[i + 4][j + 3] + pixelMatrix[i + 5][j + 2] <= 500)) {
              left_top_y = j;
              break;
            }

          }
        }
        if (left_top_y != -1) {
          break;
        }
      }
      if (left_top_x == -1 | left_top_y == -1) {
        console.log('Do not find point2');
        lower_right_xy.push(-1);
        lower_right_xy.push(-1);
        resolve(lower_right_xy);
      }
      else {
        lower_right_x = left_top_x + 15 + original_width - 120;
        lower_right_y = left_top_y + 15;
        lower_right_xy.push(lower_right_x);
        lower_right_xy.push(lower_right_y);
        console.log('lower_right_x2:' + lower_right_x + '  lower_right_y2:' + lower_right_y);
        resolve(lower_right_xy);
      }
    });
  });
}

module.exports = { pre_total: pre_total };