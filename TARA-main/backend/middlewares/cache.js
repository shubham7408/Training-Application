const redisClient = require("../redis/redisClient");

const cacheMiddleware = async (req, res, next) => {
    const project_id = req.params.id;
    const email = req.query.email;

    let cacheKey = req.originalUrl;
    if (project_id) {
        cacheKey += `:${project_id}`;
        if (email) {
            cacheKey += `:${email}`;
        }
    }

    try {
        const data = await redisClient.get(cacheKey);
        if (data) {
            console.log(`Cache hit for key: ${cacheKey}`);
            return res.send(JSON.parse(data));
        } else {
            console.log(`Cache miss for key: ${cacheKey}`);
            next();
        }
    } catch (err) {
        console.error("Redis error:", err);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};

module.exports = cacheMiddleware;
