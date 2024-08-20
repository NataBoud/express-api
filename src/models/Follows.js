const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowsSchema = new Schema({
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Follows = mongoose.model('Follows', FollowsSchema);

module.exports = Follows;