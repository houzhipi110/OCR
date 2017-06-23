var base64data='/xx/xxa/xxa/x/xx/';
// var str = base64data.replace(/ \ / /g, 'ha');
//console.log(str);

arr=base64data;

var arr = base64data.split('/');  
    var afterName = "";  
    for(var i=0; i<arr.length; i++){  
        afterName += arr[i] + '\\/';  
    }
console.log("1");