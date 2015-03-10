var fs = require('fs');
var express = require('express');
var logger = require('morgan');
var async = require('async');
var ejs = require('ejs');
var socketio = require('socket.io');
// create the express app
var app = express();
var server = app.listen(1234);
var io = socketio.listen(server);
var logFileArray = [];

app.set('view engine', 'ejs');

// connect the Morgan logging middleware to our app
app.use( logger('dev') );



var doneFuncMaker = function(argv){
	return function(done){
		fs.readFile('./'+argv, function(err,data){
			done(null,data);
		});
	};
};



// take a list of files from the command line.
// now we can watch three files using:
// node app.js file1.js file2.js file3.js
var filenames = Array.prototype.slice.call(process.argv, 2);
//console.log(filenames);

filenames.forEach(function(file){
	logFileArray.push(doneFuncMaker(file));
});




app.get('/', function (request, response) {
  var mapFilenamesToContent = function(filename, doneCallback) {
  	fs.readFile('./'+filename,function(err,data){
  		//console.log(filename,filename.replace(/[^0-9]/ig));
  		return doneCallback(null,{ id: filename.replace(/[^0-9]/ig, ""),data: data.toString(),filename: filename});
  	});
    // your code here, and in parameter list above
    //return doneCallback(null, contentString ));
  };

  async.map(filenames, mapFilenamesToContent, function (err, results) {
    if (err) console.log('async.map error:', err);
    response.render( 'mainView',{files: results} );
  });



 //  async.parallel(logFileArray, function(err,data){
	// 	if(err)
	// 		return console.error(err);
	// 	else {
	// 		response.send('<pre>' + data.toString() + '</pre>');
	// 	}
	// });
});

fs.watch('./',function(event,filename){
	fs.readFile('./'+filename,function(err,data){
		if(err) return console.error(err);
		console.log("filechanged");
  		io.sockets.emit('filechanged', { filename: filename, data:data.toString(),id: filename.replace(/[^0-9]/ig, "")});
  		
  	});

});


// when someone requests http://localhost:1234/, run the callback
// function listed here and respond with the data
// we call this the "/" (or "Root") route.

