var express = require('express');
var markdown = require('markdown').markdown;
var router = express.Router();
var Post = require('../models/post');
var User = require('../models/user');
var Comment = require('../models/comment');

var commentsRoute = require('./comments');

function NotFoundError (next) {
	var err = new Error('Not Found');
	err.status = 404;
	console.log(err);
	next(err);
}

router.use(function (req, res, next) {
	if(!req.isAuthenticated()) {
		res.redirect('/');
	}
	next();
})

router.use('/:id', function (req, res, next) {
	Post.findById(req.params.id, function (err, post) {
		if(err){
			return next(err);
		}
		if(post){
			req.post = post;
			next();
		}
		else {
			NotFoundError(next);
		}
	})
})

// router.use(function (req, res, next) {
// 	req.user = User.findById('55dec30e5eb364416fa1c9fb', function (err, user) {
// 		if(err) return next(err);
// 		req.user = user;
// 		next();
// 	})
// })


/* GET home page. */
router.get('/', function(req, res, next) {
  Post.find({},null, { sort : { created : -1 } }, function (err, posts) {
  	if(!err){
  		Post.populate(posts, { path : 'author' }, function (err, populatedPosts) {
  			if(!err){
  				res.render('blog', { posts : populatedPosts} );
  			}
  		})
  	}
  })
});

// Create Blog Post
router.post('/', function(req, res, next) {
  var newPost = new Post({
  	author : req.user._id,
  	title : req.body.title,
  	content : req.body.content,
  	created : Date.now(),
  	updated : Date.now(),
  	comments : []
  });
  newPost.save(function (err) {
  	if(err) return console.error(err);
  	res.redirect('/blog');
  })
});

// Read Blog Post
router.get('/:id', function (req, res, next) {
	Post.populate(req.post, [{path : 'author'}, {path : 'comments'}], function (err, post) {
		// populateComments(req.post.comments);
		Comment.populate(post.comments, {path : 'author'}, function (err) {
			if(!err){
				res.render('post', { post : req.post, md : markdown});
			}
		})
	});
})

// Update blog post
router.put('/:id', function (req, res, next) {
	if(req.post.author.toString() != req.user._id.toString()){
		var err = new Error('Forbidden');
		err.status = 403;
		next(err);
	}
	else if(req.post.title != req.body.title || req.post.content != req.body.content) {
		req.post.title = req.body.title;
		req.post.content = req.body.content;
		req.post.updated = Date.now();
		req.post.save(function (err) {
			if(err) return next(err);
			console.log(req.post._id, "updated");
			res.redirect('/blog/'+req.post._id);
		})
	}
	else {
		res.redirect('/blog/'+req.post._id);
		console.log("nothing to update");
	}
})

// Edit blog post
router.get('/:id/edit', function (req, res, next) {
	// console.log(typeof req.post.author.toString())
	// console.log(typeof req.user._id.toString())

	// console.log(req.post.author === req.user._id)
	// console.log(req.user._id)
	if(req.post.author.toString() != req.user._id.toString()){
		var err = new Error('Forbidden');
		err.status = 403;
		next(err);
	}
	else {
		res.render('editPost', { post : req.post });
	}
})

// Delete blog post
router.delete('/:id', function (req, res, next) {
	req.post.remove(function (err, post) {
		if(err) return next(err);
		console.log(post._id, "removed");
	})
	res.send();
})

// Comments
router.use('/:id/comments', commentsRoute);

module.exports = router;

function populateComments (comments) {
	console.log("before")
	console.log(comments)
	comments.forEach(function (comment, index) {
		console.log("before", comments[index])
		comments[index].populate('replies', function (err) {
		if(err) {
			console.error(err);
		}
		console.log("after", comments[index])
		populateComments(comments[index].replies);
	});
	});
	console.log("after")
	console.log(comments);
}