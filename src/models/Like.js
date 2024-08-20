const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
});

const Like = mongoose.model('Like', LikeSchema);

module.exports = Like;
