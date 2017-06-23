//pre-operation
//deskew 

//deskew 

var gm = require('gm').subClass({imageMagick: true});

// 
gm()
.command('convert')
.in('rotation30.jpg')
.out('-deskew')
.out('80%') //set threshold to dekskew (default 80% )
.write('deskew.jpg', function (err) {
  if (!err) {console.log('image deskew done');}else{console.log(err+'error');}
});