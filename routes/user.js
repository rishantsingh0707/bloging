const { Router } = require("express");
const User = require("../models/user")
const router = Router();

// SIGNIN ROUTE  

router.get("/signin", (req, res) => {
    return res.render("signin")
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const Token = await User.matchPasswordAndGenerateToken(email, password);

    res.cookie("Token",Token).redirect("/");
  } catch (err) {
    return res.render("signin",{error: "Incorrect Email OR Password"});
}
});

// SIGNUP ROUTE

router.get("/signup", (req, res) => {

    return res.render("signup");
  
});

router.post("/signup", async (req, res) => {
    const { fullname, email, password } = req.body;

    await User.create({
        fullname,
        email,
        password
    })

    return res.redirect("/")
})

router.get("/logout",(req,res)=>{
    res.clearCookie("Token").redirect("/")
})

module.exports = router