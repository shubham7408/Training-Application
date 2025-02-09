const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { fetchUserDetailsByEmail } = require("../services/common_function");

passport.use(
    new LocalStrategy(
        { usernameField: "email" },
        async (email, password, done) => {
            try {
                const user = await fetchUserDetailsByEmail(email);

                if (user == null) {
                    return done(null, false, "No user found with that phone number");
                }
                userPassword = user.PASSWORD+user.ROLE; 
		if (userPassword === password) {
			return done(null, user);
                } else {
                    return done(null, false, "Incorrect password");
                }
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, { email: user.EMAIL, role: user.ROLE });
});

passport.deserializeUser(async (userDetail, done) => {
    try {
        const user = await fetchUserDetailsByEmail(userDetail.email);
        done(null, { email: user.EMAIL, id: user.ID, role: user.ROLE });
    } catch (error) {
        done(error);
    }
});

module.exports = passport;
