const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");


// User 스키마 정의
let UserSchema = new mongoose.Schema({
    username: String, // email
    //email: String,
    password: String,
    name: String,
    amount: {
        type: Number,
        default: 0
    }, // 내야 할 금액
    pay_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment'
        }
    ],
    party_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Party'
        }
    ],
    review_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    profile_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        }
    ]
});

UserSchema.plugin(passportLocalMongoose); 
let User = mongoose.model("User", UserSchema);
module.exports = User; 