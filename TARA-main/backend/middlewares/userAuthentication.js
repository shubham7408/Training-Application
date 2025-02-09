const userMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        // User is authenticated, proceed to the next middleware/route handler
        next();
    } else {
        // User is not authenticated, send an unauthorized response
        res.status(401).send({ error: "User not authenticated" });
    }
};

module.exports = { userMiddleware };