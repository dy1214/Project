const mongoose = require("mongoose");


let ReviewSchema = new mongoose.Schema({
    user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
    },

    party_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Party'
    },
    
    title: String, // 콘텐츠 이름
    content: String, // 내용
    rating: Number, // 별점
});

let Review = mongoose.model("Review", ReviewSchema);
module.exports = Review; 