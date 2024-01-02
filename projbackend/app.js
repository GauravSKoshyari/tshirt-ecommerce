require("dotenv").config();           // coming from doc - https://www.npmjs.com/package/dotenv

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//My routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const paymentBRoutes = require("./routes/paymentBRoutes");


//DB Connection
mongoose
  .connect(process.env.DATABASE, { //DATABASE=mongodb://localhost:27017/tshirt   ; tshirt is name of DB 
    // if u r using some online services , u can get this string from there 
    // all environment variables are attached to process 

    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//My Routes - these are also middlewares , we r using app.use()
app.use("/api", authRoutes);        // all routes need to be prefixed with /api , eg: localhost:8000/api/signout 
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentBRoutes);

//PORT
const port = process.env.PORT || 8000;

//Starting a server
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
