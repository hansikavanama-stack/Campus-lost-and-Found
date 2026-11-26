
import express from 'express';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Submit a claim
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { itemId, message } = req.body;

        if (!itemId || !message) {
            return res.status(400).json({
                message: 'Item ID and message are required'
            });
        }

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: 'Item not found'
            });
        }

        if (item.reportedBy.toString() === req.user.id) {
            return res.status(403).json({
                message: 'You cannot claim your own item'
            });
        }

        if (item.status === 'claimed') {
            return res.status(400).json({
                message: 'This item has already been claimed'
            });
        }

        const existingClaim = await Claim.findOne({
            item: itemId,
            claimedBy: req.user.id,
            status: 'pending'
        });

        if (existingClaim) {
            return res.status(400).json({
                message: 'You already submitted a claim'
            });
        }

        const claim = await Claim.create({
            item: itemId,
            claimedBy: req.user.id,
            message
        });

        res.status(201).json({
            message: 'Claim submitted successfully',
            claim
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 2. Get logged-in user's claims
router.get('/my-claims', authMiddleware, async (req, res) => {
    try {
        const claims = await Claim.find({
            claimedBy: req.user.id
        })
            .populate('item')
            .sort({ createdAt: -1 });

        res.json(claims);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});



// Get claims received on the logged-in user's items
router.get('/received', authMiddleware, async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate({
                path: 'item',
                match: { reportedBy: req.user.id },
                select: 'itemName type category location reportedBy'
            })
            .populate('claimedBy', 'name')
            .sort({ createdAt: -1 });

        const receivedClaims = claims.filter(claim => claim.item !== null);

        res.status(200).json(receivedClaims);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

// 4. Approve or reject a claim by item owner
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be approved or rejected'
            });
        }

        const claim = await Claim.findById(req.params.id)
            .populate('item');

        if (!claim) {
            return res.status(404).json({
                message: 'Claim not found'
            });
        }

        if (claim.item.reportedBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Only the item owner can review this claim'
            });
        }

        if (claim.status !== 'pending') {
            return res.status(400).json({
                message: 'This claim has already been reviewed'
            });
        }

        claim.status = status;
        await claim.save();

        if (status === 'approved') {
            await Item.findByIdAndUpdate(claim.item._id, {
                status: 'claimed'
            });
        }

        res.json({
            message: `Claim ${status} successfully`,
            claim
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

export default router;
