const { validateToken } = require("../services/authentication");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust path as needed


function checkForAuthenticationCookies(cookieName) {
    return async (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];


        if (!tokenCookieValue) {
            console.log(`❌ No token found in cookies for ${req.method} ${req.originalUrl}`);
            return next();  // Let unauthenticated requests continue if your logic allows it
        } 
        try {
            const decoded = jwt.verify(tokenCookieValue, "Vengeance"); // use your actual secret

            const user = await User.findById(decoded._id);
            if (!user) {
                console.log("❌ No user found in DB");
                return next();
            }


            req.user = user;
            console.log("user found", req.user)

        } catch (error) {
            console.log("❌ Error decoding token or fetching user:", error.message);
        }

        next();
    };
}

module.exports = { checkForAuthenticationCookies };


