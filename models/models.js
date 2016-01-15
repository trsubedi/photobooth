var mongoose = require('mongoose'),
Schema = mongoose.Schema,
bcrypt = require('bcrypt'),
salt = bcrypt.genSaltSync(10);

// SCHEMAS

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};



var UserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: 'Email address is required',
		validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
	},
	passwordDigest: {
		type: String,
		required: true
	}
});

var PhotoSchema = new Schema({
	img: { data: Buffer, contentType: String },
	text: String,
	author: {
    	type: Schema.Types.ObjectId,
    	ref: 'User'
  	}
});

// create a new user with secure (hashed) password
UserSchema.statics.createSecure = function (name, email, password, callback) {
	// `this` references our schema
	// store it in variable `that` because `this` changes context in nested callbacks
	var that = this;

	// hash password user enters at sign up
	bcrypt.genSalt(function (err, salt) {
		bcrypt.hash(password, salt, function (err, hash) {
			// create the new user (save to db) with hashed password
			that.create({
				name: name,
				email: email,
				passwordDigest: hash
			}, callback);
		});
	});
};

// authenticate user (when user logs in)
UserSchema.statics.authenticate = function (email, password, callback) {
	console.log(password);
	// find user by email entered at log in
	this.findOne({email: email}, function (err, user) {
		console.log(password);
		console.log(user);

		// throw error if can't find user
		if (user === null) {
			throw new Error('Can\'t find user with email ' + email);
			// if found user, check if password is correct
		} else if (user.checkPassword(password)) {
			callback(null, user);
		}
	});
};

// compare password user enters with hashed password (`passwordDigest`)
UserSchema.methods.checkPassword = function (password) {
	// run hashing algorithm (with salt) on password user enters in order to compare with `passwordDigest`
	return bcrypt.compareSync(password, this.passwordDigest);
};

var Photo = mongoose.model('Photo', PhotoSchema);  
var User = mongoose.model('User', UserSchema);

module.exports.Photo = Photo;
module.exports.User = User;