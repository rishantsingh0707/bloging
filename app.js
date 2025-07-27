require("dotenv").config();

const express = require("express");
const path = require("path")
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
const MongoStore = require("connect-mongo");

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "Vengeance",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: "sessions"
    })
}));

app.use(flash());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookies("Token"));
app.use(setUser);
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(methodOverride("_method"));

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URL || "mongodb+srv://Rishant_Singh:Rishant1408@blogproject.tnluecy.mongodb.net/blogify?retryWrites=true&w=majority", {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
        });
        console.log("✅ MongoDB connected");

        // ✅ Now define your routes (AFTER connection)
        app.get("/", async (req, res) => {
            try {
                const blogs = await Blog.find()
                    .populate("createdBy")
                    .sort({ createdAt: -1 });

                const error = req.flash("error");
                const success = req.flash("success");

                res.render("home", {
                    blogs,
                    error: error.length > 0 ? error : null,
                    success,
                });
            } catch (err) {
                res.status(500).send("Error loading blogs");
            }
        });

        app.use("/user", userRoute);
        app.use("/blog", blogRoute);

        // ✅ Start server only locally (not in Vercel)
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, () => {
            console.log(`🚀 Server started on port ${PORT}`);
        });


    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
    }
}

startServer();



module.exports = app;
