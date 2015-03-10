var fs = require('fs');
var async = require('async');
var logFileArray = [];


var doneFuncMaker = function(argv){
	return function(done){
		fs.readFile('./'+argv, function(err,data){
			done(null,data);
		});
	};
};


for(var i=2;i<process.argv.length;i++){
	logFileArray.push(doneFuncMaker(process.argv[i]));
}

async.parallel(logFileArray, function(err,data){
	if(err)
		return console.error(err);
	else {
		var arr = data.toString().split(',');
		arr.forEach(function(e){console.log(e);});
	}
});

