var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

passport.use(new LocalStrategy(
	function (username, password, done) {
		User.findOne({ name : username, pass : password }, function (err, user) {
			console.log("user", user);
			if(err) return console.error(err);
			if(!user){
				return done(null, false, {message : 'Invalid username or password'});
			}
			else
				done(null, user);
		})
	}))