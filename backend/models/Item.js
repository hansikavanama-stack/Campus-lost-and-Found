
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'claimed'],
        default: 'available'
    }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

export default Item;
