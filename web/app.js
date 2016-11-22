var express = require('express');
var path = require('path');
var routes = require('./routes');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/washing_machine');
var ejs = require('ejs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html',ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){
	var collection = db.get('machine');
		collection.distinct("logo",function(e,logos){
			collection.distinct("model",function(e,models){
			
			collection.find({},{"logo":0,"model":0},function(e,docs){
		res.render('index', { title: 'Welcome to shoping washing machines!!' ,logos:logos,models:models,list:docs});
			});
		});
		});
	
});

app.get('/model',function(req,res){
	var logo = req.query.logo;
	var model = req.query.model;
	var collection = db.get('machine');
	if(model==null)
	{
		collection.find({"logo":logo},function(e,docs){
		res.render('model',{title:"model",list:docs});
		
		});
	}else{
		collection.find({"logo":logo,"model":model},function(e,docs){
		res.render('model',{title:"model",list:docs});
		
		});
	}
});

app.get('/buy',function(req,res){
	var machineId = req.query.machineId;
	res.render('buy',{machineId:machineId});
});
app.get('/machinedetail',function(req,res){
	var machineId = req.query.machineId;
	var collection = db.get('machine');
	collection.find({"machineId":machineId},function(e,docs){
		res.render('machinedetail',{li:docs,machineId:machineId});
		});
});
app.get('/success',function(req,res){
	var customerName = req.query.customerName;
	var customerPhone = req.query.customerPhone;
	var customerAddress = req.query.customerAddress;
	var machineId = req.query.machineId;
	var payment = req.query.payment;
	var delivery = req.query.delivery;
	var mccollection = db.get('machine');
	var ctcollection = db.get('customer');
	if(customerName!="" && customerPhone!="" && customerAddress!="")
	{
	    mccollection.find({"machineId":machineId},function(err,doc){
		ctcollection.insert([{"name":customerName,"phone":customerPhone,"address":customerAddress,"machineId":machineId ,"payment":payment,"delivery":delivery}],function(err,docs){
	    if(err){
			console.log(err);
		}else{
			mccollection.update({"machineId":machineId},{$set:{"store_num":doc[0].store_num-1}});
			res.send('Shopping Success and welcome you next shopping');
		}
		
	});
	});
	}else{
		res.send("Please fill all information and we will not let others know!!Or we will not send it to you !");
				//res.render('machinedetail');
	}

});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(6666,function(){
	console.log("Server Start");
})
module.exports = app;
