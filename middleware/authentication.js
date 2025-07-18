const { validateToken } = require("../services/authentication");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust path as needed


// function checkForAuthenticationCookies(cookieName) {
//     return (req, res, next) => {
//         const tokenCookieValue = req.cookies[cookieName]
//         if (!tokenCookieValue) {
//             return next();
//         }
//         try {
//             const userPayload = validateToken(tokenCookieValue);
//             req.user = userPayload;
//             res.locals.user = userPayload;
//         } catch (error) { }
//         next()
//     }
//

function checkForAuthenticationCookies(cookieName) {
    return async (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        console.log("🍪 Cookie value:", tokenCookieValue);

        if (!tokenCookieValue) {
            console.log("❌ No token found in cookies");
            return next();
        }

        try {
            const decoded = jwt.verify(tokenCookieValue, "Vengeance"); // use your actual secret
            console.log("✅ Decoded user from token:", decoded);

            const user = await User.findById(decoded._id);
            if (!user) {
                console.log("❌ No user found in DB");
                return next();
            }

            console.log("✅ User fetched from DB:", user);

            req.user = user;
            res.locals.user = user;
        } catch (error) {
            console.log("❌ Error decoding token or fetching user:", error.message);
        }

        next();
    };
}

module.exports = { checkForAuthenticationCookies };


module.exports = { checkForAuthenticationCookies }