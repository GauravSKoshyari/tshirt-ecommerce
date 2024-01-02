var mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");

var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    userinfo: {
      type: String,
      trim: true
    },
    encry_password: {          // we don't save plain passwords
      type: String,
      required: true
    },
    salt: String,                 // used for passwords 
    role: {             // generally , higher the role , more priviledges u have , eg: 0 for user , 1 for admin ,etc 
      type: Number,
      default: 0
    },
    purchases: {
      type: Array,
      default: []
    }
  },
  { timestamps: true }    // when i create new entry through this schema , it records exact  time  and stores in database
);

// a virtual is a property that is not stored in MongoDB.
userSchema
  .virtual("password")
  .set(function (password) {              // we get this password from user in req.body -eg:  https://mongoosejs.com/docs/tutorials/virtuals.html#virtual-setters
    // 
    this._password = password;
    this.salt = uuidv1();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  autheticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";        // we r returning "" ,so that it can throw error , since encry_password is required ;  means if someone doesn't enter anything in password field , it will throw error  
    try {
      return crypto
        .createHmac("sha256", this.salt)           // salt is a uuid string 
        .update(plainpassword)            // we want to get encrypted password form plain password 
        .digest("hex");
    } catch (err) {
      return "";        // return ""  means throwing error , since encry_password is required
    }
  }
};

module.exports = mongoose.model("User", userSchema);
