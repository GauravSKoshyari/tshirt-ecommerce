const User = require("../models/user");
const { check, validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req);
  // https://express-validator.github.io/docs/guides/getting-started
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg                  // when there will be error , we will get message  which are defined as 2nd para to check() in  routes/auth.js
    });
  }

  // if we pass json data  while doing signup  post request , req.body will have access to it , since in middlewares we have used  app.use(bodyParser.json()) 
  // if we need to pass data in other format -> check doc  for body-parser 

  const user = new User(req.body);
  user.save((err, user) => {                  // saving to database , we can pass callback to save()  , user inside callback is object stored in db  and it can be named  anything 
    // to check saved info  , can also check Robo3T
    if (err) {
      return res.status(400).json({          // 400 -bad request ; 
        err: "NOT able to save user in DB"
      });
    }
    //if we dont' use return above , below statement will also get executed in case of  error 
    // NOTE: we r sending these responses(both below and above ) to frontend  

    // u can do res.json(user) to check all things  in user  in POSTMAN
    res.json({                    // res.json()  - sending json response
      name: user.name,
      email: user.email,
      id: user._id         // By default, Mongoose adds an _id property to your schemas; https://mongoosejs.com/docs/guide.html#_id
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg
    });
  }

  User.findOne({ email }, (err, user) => {     // user is returned object from db , it will have lot of properties which are defined in models/user.js
    if (err || !user) {
      return res.status(400).json({
        error: "USER email does not exists"
      });
    }

    // email is found , now we check wheter password is correct or not 
    if (!user.autheticate(password)) {
      return res.status(401).json({
        error: "Email and password do not match"
      });
    }

    //signin the user  

    //create token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET);                //  https://mongoosejs.com/docs/guide.html#_id -> By default, Mongoose adds an _id property to your schemas.

    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });   //  we save key-value pair in cookie ; 1st para can be any name

    //send response to front end
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
    // sending token  so that , frontend apps can set this token into their localstorage 
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");          // we have access to clearCookie() method because  of cookie-parser ; we named it "token" in line 68
  res.json({
    message: "User signout successfully"
  });
};

//protected routes
exports.isSignedIn = expressJwt({
  // expressJwt() - used to create middleware for verifying JSON Web Tokens (JWT) in incoming HTTP requests.

  secret: process.env.SECRET,
  userProperty: "auth"                  // can be named anything
  // CHATGPT - This option sets the name of the property where the authenticated user information will be attached to the request object. After successful authentication, the verified user's information (usually the payload of the JWT) will be available in req.auth.
});
// this is middleware , but we r not using nexT() -> expressJwt  has covered that for us


//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  // req.profile  is because of middleware getUserById in user.js , which is populating req.profile using param in route
  //req.auth - will be setted up by isSignedIn middleware 

  if (!checker) {
    return res.status(403).json({
      error: "ACCESS DENIED"
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "You are not ADMIN, Access denied"
    });
  }
  next();
};
