const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post(
    "/login",
    passport.authenticate("local", {
        successMessage : "Success",
        failureMessage : "Failed to login."
    }),
    (req, res, next) => {
        req.session.user = req.user;
        res.send({ "status" : "success"})
    }
);

// Logout route
router.get('/logout', (req, res) => {
    const sessionStore = req.sessionStore;

    if (req.session) {
        sessionStore.destroy(req.sessionID, (err) => {
            if (err) {
                return next(err)
            }
            req.session = null;
            res.send({ "status" : "success"})
        });
    }
});

// Get user email route
router.get('/user', (req, res) => {
    if (req.session.user) {
        res.send(`User email: ${req.session.user.EMAIL}`);
    } else {
        res.status(401).send('Not logged in');
    }
});

module.exports = router;