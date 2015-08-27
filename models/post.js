var mongoose = require('mongoose');

var Post = mongoose.model('Post', {
	id : String,
	author : {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'User'
	} ,
	title : String,
	content : String,
	created : Date,
	updated : Date,
	comments : [{
		type : mongoose.Schema.Types.ObjectId,
		ref : 'Comment'
	}]
});

module.exports = Post;