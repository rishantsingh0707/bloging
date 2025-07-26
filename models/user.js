const { profile, timeStamp } = require("console")
const {Schema,model} =require("mongoose");
const {createHmac, randomBytes, createHash} =require("crypto")
const { type } = require("os");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullname: {
        type :String,
        required : true,
    },
    email:{
        type : String,
        required : true,
        unique : true,
    },
    salt:{
        type : String,
    },
    password:{
        type: String,
        required: true,
    },
    profileImageURL:{
        type : String,
        default : "/images/Default_Profile_Image.png"
    }, 
    role:{
        type:String,
        enum : ["USER","ADMIN"],
        default: "USER"
    }
},{timestamps:true})


userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  const salt = randomBytes(16).toString();
  const hashedPassword = createHash("sha256").update(user.password + salt).digest("hex");

  user.salt = salt;
  user.password = hashedPassword;

  next();
});


userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("User not found");

  const salt = user.salt;
  const hashedPassword = user.password;

  const userProvidedHash = createHash("sha256").update(password + salt).digest("hex");

  if (userProvidedHash !== hashedPassword) throw new Error("Incorrect password");

  const Token = createTokenForUser(user);
  return Token
};


const User= model("user",userSchema);

module.exports= User