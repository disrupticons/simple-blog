var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', function (req, res, next) {
	User.findOne({ name : req.body.username }, function (err, user) {
		if(err) return console.error(err);
		if(!user){
			var newUser = new User({
				name : req.body.username,
				email : req.body.email,
				pass : req.body.pass
			});
			newUser.save(function (err) {
				if(err) return next(err);
				console.log("user created");
				res.redirect('/');
			})
		}
		else {
			res.send('Username already exists!');
		}
	})
	
})

// router.get('/login', function (req, res, next) {
// 	res.render('login');
// })

router.post('/login', passport.authenticate('local', {successRedirect : '/home', failureRedirect : '/'}));

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
})

router.get('/home', function (req, res, next) {
	if(req.isAuthenticated()){
		res.render('home', { user : req.user });
	}
	else {
		res.redirect('/')
	}
})

module.exports = router;
