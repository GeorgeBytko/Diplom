const User = require('./models/User')
const passport = require('passport')
const {Strategy} = require('passport-local')


passport.use(new Strategy(
    function(username, password, done) {
        User.findOne({ name: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!(user.password === password)) {
                return done(null, false);
            }

            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });

});
module.exports = passport
