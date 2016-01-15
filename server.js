// SERVER-SIDE JS

// REQUIREMENTS

var express = require('express'),
app = express(),
bodyParser = require('body-parser'),
_ = require('underscore'),
db = require('./models/models'),
mongoose = require('mongoose'),
session = require('express-session');

var MongoStore = require('connect-mongo')(session);

// server js and css files from public folder
app.use(express.static(__dirname + '/public'));

// configure bodyParser for handling data
app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}));

// connect to mongo server
mongoose.connect(
	process.env.MONGOLAB_URI || 'mongodb://localhost/darkroom'
);

// set session options
app.use(session({
	saveUninitialized: true,
	resave: true,
	secret: 'DarkroomCookieSecret',
	// one hour
	cookie: { maxAge: 3600000 },
	// to preserve the session of user, uses existing mongoose connection
	store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// middleware to manage sessions
app.use('/', function (req, res, next) {
  // saves userId in session for logged-in user
  req.login = function (user) {
  	req.session.userId = user.id;
  };

  // finds user currently logged in based on `session.userId`
  req.currentUser = function (callback) {
  	db.User.findOne({_id: req.session.userId}, function (err, user) {
  		req.user = user;
  		callback(null, user);
  	});
  };

  // destroy `session.userId` to log out user
  req.logout = function () {
  	req.session.userId = null;
  	req.user = null;
  };

  next();
});

// ROUTES //

// root route (serves index.html, create.html, gallery.html)
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/views/index.html');
});

app.get('/create', function(req, res) {
	res.sendFile(__dirname + '/public/views/create.html');
});

app.get('/gallery', function(req, res) {
	res.sendFile(__dirname + '/public/views/gallery.html');
});

// TESTING ONLY
// returns an image on the filesystem
app.get('/images/:name', function(req, res) {
	res.sendFile(__dirname + '/public/images/' + req.params.name);
});

app.get('/currentUser', function(req, res) {
	req.currentUser(function(err, user) { 
		res.json(user);
	});
});

// POST ROUTE FOR CREATING NEW EDITED images
app.post('/api/photos', function(req, res) {
	// boiling data down to pixel info
	var rawImageData = req.body.imageData;
	rawImageData = rawImageData.replace('data:image/png;base64,', '');
	rawImageData = rawImageData.replace(' ', '+');

	// Storing image data into buffer
	var imageData = new Buffer(rawImageData, 'base64');

	req.currentUser(function(err, user) {
		// new instance of photo
		var newPhoto = new db.Photo ({
			img: {
				data: imageData,
				contentType: 'image/png'
			},
			text: req.body.text,
			author: user._id
		});

		// Persist the image data into db
		newPhoto.save(function(err, savedPhoto) {
			// Respond with object to client
			res.json({
				'_id': savedPhoto._id,
				'text': savedPhoto.text,
				'author': savedPhoto.author
			});
		});
	});
});

// find all edited photos in db
app.get('/api/photos', function(req, res) {
	db.Photo.find({}).select('text _id author').populate('author').exec(function(err, photos) {
		res.json(photos);
	});
});

// get specific Photo models
app.get('/api/photos/:id', function(req, res) {
	var photoId = req.params.id;
	db.Photo.findOne({_id: photoId}).select('text _id author').populate('author').exec(function(err, photo) {
		res.json(photo);
	});
});

// get image data only
app.get('/photos/:id', function(req, res) {
	var photoId = req.params.id;
	db.Photo.findOne({_id: photoId}, function(err, foundPhoto) {
		res.set('Content-Type', 'image/png');
		res.send(foundPhoto.img.data);
	});
});

// update existing photo posts
app.put('/api/photos/:id', function(req, res) {
	var photoId = req.params.id;
	db.Photo.findOne({_id: photoId}).select('text _id author').populate('author').exec(function(err, foundPhoto) {
		foundPhoto.text = req.body.text;

		foundPhoto.save(function(err, savedPhoto) {
			res.json(savedPhoto);
		});
	});
});

// delete post in gallery
app.delete('/api/photos/:id', function(req, res) {
	var photoId = req.params.id;
	db.Photo.remove({_id: photoId}).select('text _id author').populate('author').exec(function(err, deletePhoto) {
		res.json(deletePhoto);
	});
});

// user submits the signup form
app.post('/api/users', function(req, res) {
	// grab user data from params (req body)
	var newUser = req.body.user;

	console.log(newUser);

	// create new user with secure password
	db.User.createSecure(newUser.name, newUser.email, newUser.password, function(err, user) {
		if(err === null) {
			// saves user id to session
			req.login(user);

			res.json(user);
		} else {
			res.status(400).json(err.errors)
		}
	});
});

// user submits the login form
app.post('/api/login', function (req, res) {
	// grab user data from params (req.body)
	var userData = req.body.user;

	// call authenticate function to check if password user entered is correct
	db.User.authenticate(userData.email, userData.password, function (err, user) {
		// saves user id to session
		req.login(user);

		// redirect to user create
		res.redirect('/create');
	});
});

app.get('/logout', function(req, res) {
	req.logout();

	res.redirect('/');
});

app.listen(process.env.PORT || 3000, function() {
	console.log('Server started on localhost:3000');
});
