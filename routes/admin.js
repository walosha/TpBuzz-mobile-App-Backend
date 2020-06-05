const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { News } = require("../models/News");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const rp = require("request-promise");
const cheerio = require("cheerio");
const { ensureAuthenticated } = require("../config/auth");

//News Model

const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(require("../config/privatekeys").NewsAPI);

//ADMIN LOGIN
router.get("/dashboard", ensureAuthenticated, (req, res) => res.render("dashboard"));

//LOGIN HANDLER
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/adminstratorbase/dashboard",
    failureRedirect: "/",
    failureFlash: true
  })(req, res, next);
});

//LOGOUT HANDLER
router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

// NEW USER (STAFF)
router.post("/addstaff", ensureAuthenticated, (req, res) => {
  const { firstName, lastName, email, password, password2 } = req.body;
  let errors = [];

  //Required fields
  if ((!firstName, !lastName, !email, !password, !password2)) {
    errors.push({ msg: "Please fill in all fiedls" });
  }

  //Email
  const re = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  if (String(email).match(re) == null) {
    errors.push({ msg: "Email not valid" });
  }

  //Password Matches
  if (password !== password2) {
    errors.push({ msg: "Password do not match" });
  }

  //Password length
  if (password.length < 8) {
    errors.push({ msg: "Password should be at least 8 characters" });
  }

  if (errors.length > 0) {
    res.send({
      errors,
      firstName,
      lastName,
      email,
      password,
      password2
    });
  } else {
    //Validation Passed
    User.findOne({ email: email }).then(user => {
      if (user) {
        //User exits
        errors.push({ msg: "Email is already registered" });
        res.render("addstaff", {
          errors,
          firstName,
          lastName,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          firstName,
          lastName,
          email,
          password,
          isStaff: true,
          isSuperuser: true
        });

        //Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //Password Hashed
            newUser.password = hash;

            //Save User
            newUser
              .save()
              .then(user => {
                res.send({
                  successMessage: "Staff account created"
                });
              })
              .catch(err => console.log(err));
          })
        );
      }
    });
  }
});

//MANUAL CONTENT UPDATE
router.post("/manual-content-update", ensureAuthenticated, (req, res) => {
  const { ibrand, others } = req.body;

  console.log(req.body);

  const newsApiCall = actionType => {
    if (actionType === "topNews") {
      return new Promise((resolve, reject) => {
        const action = newsapi.v2.topHeadlines({
          country: "ng"
        });
        resolve(action);
      });
    } else if (actionType === "international") {
      const today = new Date();
      const todayISO = today.toISOString().slice(0, 10);
      return new Promise((resolve, reject) => {
        const action = newsapi.v2.everything({
          sources: "bbc-news, the-verge, business-insider, cbc-news, bloomberg, cnn",
          from: todayISO,
          to: todayISO,
          language: "en",
          sortBy: "relevancy",
          page: 5,
          pageSize: 20
        });
        resolve(action);
      });
    } else if (actionType === "politics") {
      return new Promise((resolve, reject) => {
        const action = newsapi.v2.topHeadlines({
          q: "nigeria",
          category: "politics",
          language: "en",
          country: "ng"
        });
        resolve(action);
      });
    } else if (actionType === "ibrand") {
      return new Promise((resolve, reject) => {
        let ibrandNews = { articles: [] };
        rp("https://ibrandtv.com").then(html => {
          const $ = cheerio.load(html);
          const topNewsLength = $(".twp-post", html).length;
          ibrandNews["totalResults"] = topNewsLength;
          for (let i = 0; i < topNewsLength; i++) {
            let specific = {
              id: i,
              url: $(".twp-post > .twp-description > .twp-articles-title > h3 > a", html)[i].attribs.href,
              title: $(".twp-post > .twp-description > .twp-articles-title > h3 > a", html)[i].firstChild.data,
              urlToImage: $(".twp-post > .twp-image-section > a", html)[i].attribs["data-background"].split("?")[0],
              source: "iBrandTv"
            };
            ibrandNews.articles.push(specific);
          }
          resolve(ibrandNews);
        });
      });
    }
  };

  const followUpAction = async actionType => {
    const response = await newsApiCall(actionType);
    //console.error(response.totalResults);
    let newUpdatesCount = 0;
    await Promise.all(
      response.articles.map(async news => {
        const action = await News.findOne({ title: news.title, url: news.url });
        //IF action Instance == News; update already exit, THEN pass || log
        if (action) {
          //console.log("already exist");
          //ELSE
        } else {
          const update = new News({
            title: news.title,
            publishedAt: news.publishedAt || new Date().toISOString(),
            description: news.description || "Click to read story",
            url: news.url,
            urlToImage: news.urlToImage || "https://res.cloudinary.com/ancla8techs4/image/upload/v1580539690/news_jnqvpg.jpg",
            source: news.source,
            tag: actionType
          });
          //console.log(update);
          update
            .save()
            .then(searchNews => newUpdatesCount++)
            .catch(err => console.log(err));
        }
      })
    ).catch(err => console.log(err));

    console.log(`${actionType} section DONE, ${newUpdatesCount} articles updated`);
  };

  if (ibrand == "false" && others == "false") {
    res.send({ errors: "No Category was selected" });
  } else {
    followUpAction("topNews");
    followUpAction("international");
    followUpAction("politics");
    followUpAction("ibrand");
    res.send({
      successMessage: "News update has begun. All admins will be notified when it is completed."
    });
  }
});

module.exports = router;
