var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');

router.use('/:id', function (req, res, next) {
	Comment.findById(req.params.id, function (err, comment) {
		if(err) return next(err);
		req.comment = comment;
		next();
	})
})


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Post comment
router.post('/', function (req, res, next) {
	addComment(req.body, req.user, next, function (comment) {
		req.post.comments.push(comment._id);
		req.post.save(function (err) {
			if(err) return next(err);
			console.log(comment._id, "added to", req.post._id);
			res.redirect('/blog/'+req.post._id);
		})
		
	})
})

// Reply to comment
router.post('/:id/reply', function (req, res, next) {
	addComment(req.body, req.user, next, function (comment) {
		req.comment.replies.push(comment._id);
		req.comment.save(function (err) {
			if(!err){
				console.log(comment._id, "reply added");
				res.send("reply added")
			}
			else {
				res.send("error");
			}
		})
	})
})


module.exports = router;


function addComment(comment, user, next, cb) {
	var newComment = new Comment({
		body : comment.body,
		created : Date.now(),
		author : user._id,
		replies : []
	});
	newComment.save(function (err, comment) {
		if(err) return next(err);
		cb(comment);
	})
}