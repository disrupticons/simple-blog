var mongoose = require('mongoose');

module.exports = mongoose.model('Comment', {
		body : String,
		created : Date,
		author : {
			type : mongoose.Schema.Types.ObjectId,
			ref : 'User'
		},
		replies : [{
			type : mongoose.Schema.Types.ObjectId,
			ref : 'Comment'
		}]
	});