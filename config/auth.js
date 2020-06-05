module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("error", "Admin must be logged in");
      res.redirect("/");
    }
  }
};
