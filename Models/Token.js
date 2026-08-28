const mongoose = require("mongoose");


const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isValid: { type: Boolean, default: true },
},
    { timestamps: true }
)

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


module.exports = mongoose.model("TokenSchema", TokenSchema);