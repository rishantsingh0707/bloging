require("dotenv").config();

const express = require("express");
const path = require("path")
const PORT = process.env.PORT || 8000
const app = express();
const session = require("express-session"); // ✅ Add this
const flash = require("connect-flash");
const userRoute = require("./routes/user")
const blogRoute = require("./routes/blog")
const Blog = require("./models/blog")
const methodOverride = require("method-override");
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookies } = require("./middleware/authentication");
const setUser = require("./middleware/setUser"); // adjust the path


mongoose
    .connect(process.env.MONGO_URL)
    .then(() => { console.log("mongodb connected") });

app.use(express.static(path.resolve("./public")));

app.use(session({
    secret: "Vengeance", 
    resave: false,
    saveUninitialized: false
}));

app.use(flash());


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookies("Token"));
app.use(setUser);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(methodOverride("_method"));
app.get("/", async (req, res) => {
    const blogs = await Blog.find().populate("createdBy").sort({ createdAt: -1 });

    const error = req.flash("error");
    const success = req.flash("success");

    res.render("home", { blogs, error: error.length > 0 ? error : null ,success});
});


app.use("/user", userRoute)

app.use("/blog", blogRoute)


module.exports = app;
