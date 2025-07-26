const { Schema, model, Model, default: mongoose } = require("mongoose");
const schema = mongoose.Schema
const { title, body } = require("process");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    coverImageURL: {
        type: String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', default: [] }],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 }
}, { timestamps: true });

const Blog = model("blog", blogSchema);

module.exports = Blog