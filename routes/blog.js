const { Router } = require("express");
const path = require("path");
const multer = require("multer");
const Blog = require("../models/blog")
const Comment = require("../models/comment");

const router = Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()} - ${file.originalname}`;
        cb(null, fileName);
    }
})

const upload = multer({ storage: storage })

router.get("/addBlog", (req, res) => {
    return res.render("blog")
})


router.post("/", upload.single("coverImage"), async (req, res) => {
    const { title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`,
    })

    return res.redirect(`/blog/${blog._id}`)
})

router.post("/comment/:blogId", async (req, res) => {
    await Comment.create({
        comment: req.body.content,
        blogId: req.params._id,
        createdBy: req.user._id
    });

    return res.redirect(`/blog/${req.params.blogId}`);
});


router.get("/:id", async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");

    const comments = await Comment.find({ blogId: req.params.blogId }).populate("createdBy");
console.log("Viewing blog ID:", req.params.id);

    return res.render("addBlog", {
        user: req.user,
        blog,
        comments
    });

});

module.exports = router