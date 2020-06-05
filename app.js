const express = require("express");
const expressLayout = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");

const app = express();

//EJS
app.use(expressLayout);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

//GRAPH ROUTE
app.use("/", require("./routes/graphroute"));

//BODY PARSER
app.use(express.urlencoded({ extended: true }));

//EXPRESS SESSION
app.use(
  session({
    secret: "ibrandtv",
    resave: true,
    saveUninitialized: true
  })
);

//PASSPORT CONFIG
require("./config/passport")(passport);

//PASSPORT AUTH
app.use(passport.initialize());
app.use(passport.session());

//CONNECT FLASH
app.use(flash());

//GLOBAL FLASH MESSAGES { errors }
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  next();
});

//DB CONFIG
const db = require("./config/privatekeys").MongoAtlasURI;

const startServer = async () => {
  await mongoose
    .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log("MongoDB Connected..."))
    .catch(err => console.log(err));

  //ROUTES
  app.use("/", require("./routes/index"));
  app.use("/adminstratorbase", require("./routes/admin"));
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, console.log(`Server started on port ${PORT}`));
};

startServer();
