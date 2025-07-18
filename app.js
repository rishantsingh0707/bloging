require("dotenv").config();

const express = require("express");
const path = require("path")
const PORT = process.env.PORT || 8000
const app = express();
const userRoute = require("./routes/user")
const blogRoute = require("./routes/blog")
const Blog = require("./models/blog")

const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookies } = require("./middleware/authentication");
const setUser = require("./middleware/setUser"); // adjust the path


mongoose
        .connect(process.env.MONGO_URL)
        .then(()=>{console.log("mongodb connected")});
        

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookies("Token"));
app.use(setUser);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));


app.get("/", async(req, res) => {
    const allBlogs = await Blog.find({})
    res.render("home",{
        blogs : allBlogs
    })
})

app.use("/user", userRoute)

app.use("/blog", blogRoute)

app.use(express.static(path.resolve("./public")));


app.listen(PORT, () => { console.log(`server started at port ${PORT}`) })