// Imports
import express from 'express';
const router = express.Router();





// Create post
router.post('/authenticate', async (req, res) => {
    try {
        const {username} = req.body;
    } catch (err) {
        res.status(500).json(err);
    }
});





// Export
export default router;