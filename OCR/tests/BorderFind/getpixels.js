var getPixels = require("get-pixels");
//   api parameters:   
//		input:		  path of img :							imgpath (default: 'gray.jpg')
//					  the black block length:				Flag_black_length;   (default:27)
//					  the range of coodinate  to scan:		Range_scan;  (default:100 mean:100*100)
//		output:		   pixel position:						lower_right_x ,lower_right_y

var lower_right_x;//output
var lower_right_y;//output
getPixels("gray.jpg", function(err, pixels) {
  if(err) {
    console.log("Bad image path");
    return
  }
	

	var pixelMatrix=new Array();
	for (var i=0;i<100 ; i++)
	{
		pixelMatrix[i]=new Array();
		for(var j=0;j<100;j++)
		{
			
				  //console.log(pixels.get(i,j,0));
				  pixelMatrix[i][j]=pixels.get(i,j,0);//
			   
			
		}
	}
var left_top_x=-1;
var left_top_y=-1;
	//console.log('PM70.50='+pixelMatrix[70][50]);
	for(var i=0;i<100;i++){
		//console.log('PMi.50='+pixelMatrix[i][50]);
		for(var j=0;j<100;j++){
			//console.log('PMi.50='+pixelMatrix[i][50]+'i='+i);
			if(pixelMatrix[i][j]<=50){
				if(pixelMatrix[i][j+1]+pixelMatrix[i][j+2]+pixelMatrix[i][j+3]+pixelMatrix[i][j+4]+pixelMatrix[i][j+5]<=255){
				left_top_x=i;
				break;
				}

			}
			
		}
		if(left_top_x!=-1){
			break;
		}
	
	}

	for(var j=0;j<100;j++){
			for(var i=0;i<100;i++){
				if(pixelMatrix[i][j]<=50){
					if(pixelMatrix[i+1][j]+pixelMatrix[i+2][j]+pixelMatrix[i+3][j]+pixelMatrix[i+4][j]+pixelMatrix[i+5][j]<=255){
					left_top_y=j;
					break;
					}

				}
				
			}
		if(left_top_y!=-1){
			break;
		}
	
	
	}
	
	lower_right_x=left_top_x+27;
	lower_right_y=left_top_y+27;
	console.log('lower_right_x:'+lower_right_x+'  lower_right_y:'+lower_right_y);

});


//console.log('pixels.data.length='+pixels.data.length);
	//console.log('data[70][50]='+pixels.data[298*70+50]);//pixels.data.length
  //console.log(pixels.data);
  //pixels.data.copy(buffer);
  //var haha=pixels.get(70,50,0);
	//console.log('70.50='+haha);
    //console.log("Bad image path+"+buffer);


	  //var gm = require('gm');

/*var haha;
	  getPixels("gray.jpg", function(err, pixels) {
		  if(!err) {
			  console.log(pixels.get(50,70,0));
			  //pixelMatrix[i][j]=pixels.get(50,70,0);//????(0,0)??R??
			  haha=pixels.get(50,70,0);
		  }  
		});
console.log('haha'+haha);
*/

/*var pixelMatrix=new Array();
for (var i=0;i<100 ; i++)
{
	pixelMatrix[i]=new Array();
	for(var j=0;j<100;j++)
	{
		getPixels("gray.jpg", function(err, pixels) {
		  if(!err) {
			  console.log(pixels.get(i,j,0));
			  pixelMatrix[i][j]=pixels.get(i,j,0);//????(0,0)??R??
		  }  
		});
	}
}
console.log(pixelMatrix[70][50]);
*/
/* 
gm('lena.png')
.threshold(40,1)
.write('gray.jpg', function (err) {
  if (!err) {console.log('image deskew done');}else{console.log(err+'error');}
});*/