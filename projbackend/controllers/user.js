const User = require("../models/user");
const Order = require("../models/order");

// id comes from url  eg: /user/:categoryId
exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "No user was found in DB"
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  // these shouldn't be returned   ; we r obviously not making these undefined in db 
  req.profile.salt = undefined;
  req.profile.encry_password = undefined;

  // req.profile is because of line 12 
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },                // here comes what we want to update ; eg: if we want to change just lastname , we will send {"lastname" : "Jonny" } from postman   ; 


    { new: true, useFindAndModify: false },
    (err, user) => {          // "user" will be updated user
      if (err) {
        return res.status(400).json({
          error: "You are not authorized to update this user"
        });
      }
      user.salt = undefined;
      user.encry_password = undefined;
      res.json(user);
    }
  );
};

exports.userPurchaseList = (req, res) => {
  Order.find({ user: req.profile._id })              // models -> order.js ; orderSchema  have 'user' property  whose type is ObjectId -> that's why u can do something like  find({ user: req.profile._id })  
    .populate("user", "_id name")
    // populate is used whenver we r referring to diff collection . in order.js, in OrderSchema ,we have 'user' property , which refers to  "User" collection 
    // 2nd para is what fields u want to bring in from 'User'

    // if no error , u can access -> order.user._id , order.user.name ; 'order' is below one
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No Order in this account"
        });
      }
      return res.json(order);
    });
};

// when user purchases something , it should be auto added in purchase list . there is  'purchases' property in userSchema
exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];

  // TODOS: doubt here  - will get cleared when we go to FRONTEND 

  // to understand  req.body.order.products - video 49 , 03:11
  //  order will come from frontedn ; OrderSchema  in order.js  has 'products' property which can contain multiple products 
  req.body.order.products.forEach(product => {
    purchases.push({
      _id: product._id,        // every schema or collection has _id
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,                // todos : what is quantity 
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id
    });
  });

  //store thi in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } },                 // using $push instead of $set , since here we r working with array 
    // LHS 'purchases' is coming from userSchema

    { new: true },               //  it means , object(purchases in next line ) returned is updated one 
    (err, purchases) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to save purchase list"
        });
      }
      next();
    }
  );
};
