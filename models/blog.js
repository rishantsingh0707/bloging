const {Schema,model, Model} =require("mongoose");
const { title,body } = require("process");

const blogSchema = new Schema({
    title :{
        type : String,
        required : true
    },
    body : {
        type : String,
        required : true
    },
    coverImageURL : {
        type : String
    },
    createdBy :{
        type : Schema.Types.ObjectId,
        ref : "user"
    }
},{timestamps : true})

const Blog = model("blog",blogSchema);

module.exports= Blog