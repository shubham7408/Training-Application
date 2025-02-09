const express = require('express');
const router = express.Router();
const { getUserTaskStatistics } = require('../services/toloka-apis');

router.get('/user/:userId/statistics', async (req, res) => {
    const userId = req.params.userId;
    try {
        const statistics = await getUserTaskStatistics(userId);
        if (!statistics) {
            return res.status(404).json({ error: 'Statistics not found' });
        }
        res.json(statistics);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;