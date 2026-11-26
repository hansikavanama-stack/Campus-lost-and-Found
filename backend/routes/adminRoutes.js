
import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// Admin dashboard statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalItems = await Item.countDocuments();
        const totalLostItems = await Item.countDocuments({ type: 'lost' });
        const totalFoundItems = await Item.countDocuments({ type: 'found' });
        const totalClaims = await Claim.countDocuments();
        const pendingClaims = await Claim.countDocuments({ status: 'pending' });

        res.json({
            totalUsers,
            totalItems,
            totalLostItems,
            totalFoundItems,
            totalClaims,
            pendingClaims
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

export default router;
