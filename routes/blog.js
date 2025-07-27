const { Router } = require("express");
const path = require("path");
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage: storage })

const Blog = require("../models/blog");
const Comment = require("../models/comment");
const flash = require("connect-flash");

const router = Router();


router.get("/addBlog", (req, res) => {
  return res.render("blog")
})

router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, body } = req.body;

    const coverImageURL = req.file ? `/uploads/${req.file.filename}` : null;

    const newBlog = new Blog({
      title,
      body,
      coverImageURL:req.file.path,
      createdBy: req.user._id
    });

    await newBlog.save();

    res.redirect(`/`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while creating the blog.");
    res.redirect("/");
  }
});


router.post('/:id/like', async (req, res) => {
  const blogId = req.params.id;
  const userId = req.user._id;

  try {
    const blog = await Blog.findById(blogId);

    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
      blog.likes.pull(userId); // Unlike
    } else {
      blog.likes.push(userId); // Like
    }

    blog.likesCount = blog.likes.length;
    await blog.save();

    res.redirect(`/blog/${blogId}`);
  } catch (err) {
    console.error("Like Error:", err);
    req.flash("error", "Something went wrong while liking the blog.");
    res.redirect(`/blog/${blogId}`);
  }
});



router.post("/comment/:blogId", async (req, res) => {
  const blogId = req.params.blogId; 

  try {
    const blog = await Blog.findById(req.params.blogId);
    const comments = await Comment.find({ blog: blog._id }).populate({ path: 'createdBy', strictPopulate: false }).exec();

    if (!blog) return req.flash("error", "Blog Not Found");

    if (!req.user) return req.flash("error", "Login Required!");


    // ✅ Correct way to create and save a comment

    const newComment = new Comment({
      blog: blog._id,
      createdBy: req.user._id,
      content: req.body.content
    });
    await newComment.save();

    res.redirect(`/blog/${blog._id}?comment=added`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while liking the blog.");
    res.redirect(`/blog/${blog._id}?Failed to comment`);
  }
});

// Show blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");

    if (!blog) {
      req.flash("error", "Blog not found.");
      return res.redirect("/");
    }

    const userId = req.user?._id;

    if (userId && !blog.views.includes(userId) && !blog.createdBy._id.equals(userId)) {
      blog.views.push(userId);
      blog.viewsCount = blog.views.length;
      await blog.save();
    }

    const comments = await Comment.find({ blog: blog._id}).populate("createdBy");

    console.log("Viewing blog ID:", req.params.id);

    return res.render("addBlog", {
      user: req.user,
      blog,
      comments
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load blog.");
    res.redirect("/");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      req.flash("error", "Blog not found.");
      return res.redirect("/");
    }
    // Check if current user is the creator
    if (!req.user || !blog.createdBy.equals(req.user._id)) {
      req.flash("error", "You are not authorized to delete this blog.");
      return res.redirect("/");
    }

    await blog.deleteOne();
    req.flash("success", "Blog deleted successfully.");

    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error while deleting blog.");
    res.redirect("/");
  }
});

router.get("/:id/stats", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("views", "name email")
      .populate("likes", "name email");

    if (!blog) {
      req.flash("error", "Blog not found.");
      return res.redirect("/");
    }

    // Only allow blog owner to view stats
    if (!req.user || !blog.createdBy.equals(req.user._id))  {
      req.flash("error", "You're not authorized to view these stats.");
      return res.redirect("/");
    }
    const comments = await Comment.find({ blog: blog._id }).populate("createdBy");

    res.render("blogStats", {
      blog,
      viewsCount: blog.views.length,
      views: blog.views,
      likesCount: blog.likes.length,
      likes: blog.likes
    })
  }
  catch (err) {
    console.error("Stats error:", err);
    req.flash("error", "Something went wrong while loading blog stats.");
    res.redirect("/");
  }

});


module.exports = router