const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String },
    avatarUrl: { type: String },
    dateOfBirth: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    bio: { type: String },
    location: { type: String },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'Follow' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'Follow' }],
});

UserSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
