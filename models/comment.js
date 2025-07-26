// models/Comment.js
const mongoose = require('mongoose');
const { model, Schema } = require('mongoose');

const commentSchema = new mongoose.Schema({
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'blog', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now }
},{ timestamps: true });

const Comment = model("comment", commentSchema);

module.exports = Comment