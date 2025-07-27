const { Router } = require("express");
const User = require("../models/user")
const router = Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads/profile_pics"));  // make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });


// SIGNIN ROUTE  

router.get("/signin", (req, res) => {

    let error = req.flash("error");

    if (error.length === 0) error = null;

    return res.render("signin", { error })

});

router.post("/signin", async (req, res) => {
    try {

        console.log("📥 Incoming signin data:", req.body); // ⬅️ This will show if body is empty

        const { email, password } = req.body;

        const Token = await User.matchPasswordAndGenerateToken(email, password);

        res.cookie("Token", Token, {
            httpOnly: true,                    // prevent JS access to cookie
            secure: process.env.NODE_ENV === "production", // only use HTTPS in prod
            sameSite: "lax",                   // adjust if you're using cross-site cookies
            maxAge: 24 * 60 * 60 * 1000        // 1 day expiration
        }).redirect("/");

    } catch (err) {
        req.flash("error", "Incorrect Email or Password.");
        res.redirect("/user/signin");
    }
});

// SIGNUP ROUTE

router.get("/signup", (req, res) => {
    let error = req.flash("error");

    if (error.length === 0) error = null;
    return res.render("signup");

});

router.post("/signup", upload.single("profileImage"), async (req, res) => {
    const { fullname, email, password } = req.body;

    await User.create({
        fullname,
        email,
        password,
        profileImageURL: req.file ? `/uploads/profile_pics/${req.file.filename}` : undefined
    })
    console.log("Uploaded file:", req.file);


    return res.redirect("/")
})

router.get("/logout", (req, res) => {
    res.clearCookie("Token").redirect("/")
})

module.exports = router