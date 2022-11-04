const mongoose = require("mongoose");

// Payment 스키마 정의
let PaymentSchema = new mongoose.Schema({
    user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
    },

    card_num: String, // 카드 번호
    expiry: String, // 카드 유효기간 MM/YY
    birth: String, // 생년월일 YYMMDD
    pwd_2digit: String // 비밀번호 앞 두자리
});

let Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment; 