
import express from 'express';
import Item from '../models/Item.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Get all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find()
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(items);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 2. Search and filter items
router.get('/search', async (req, res) => {
    try {
        const { keyword, category, location, type } = req.query;

        const filter = {};

        if (keyword) {
            filter.$or = [
                { itemName: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (location) {
            filter.location = location;
        }

        if (type) {
            filter.type = type;
        }

        const items = await Item.find(filter)
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(items);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 3. Report a lost or found item
// 3. Get items reported by logged-in user
router.get('/my-items', authMiddleware, async (req, res) => {
    try {
        const items = await Item.find({
            reportedBy: req.user.id
        }).sort({ createdAt: -1 });

        res.json(items);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            itemName,
            type,
            category,
            description,
            location,
            date,
            image
        } = req.body;

        if (!itemName || !type || !category ||
            !description || !location || !date) {
            return res.status(400).json({
                message: 'Please fill all required fields'
            });
        }

        const item = await Item.create({
            itemName,
            type,
            category,
            description,
            location,
            date,
            image,
            reportedBy: req.user.id
        });

        res.status(201).json({
            message: 'Item reported successfully',
            item
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

export default router;
