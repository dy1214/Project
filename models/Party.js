const mongoose = require("mongoose");

// Party 스키마 정의
let PartySchema = new mongoose.Schema({
    ott_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OTT'
    },
    ott_name: String, // 넷플릭스, 티빙, 웨이브, 디즈니 플러스

    author: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' 
        },
        name: String
    },

    owner_id: String, // 파티장 주인 아이디
    owner_password: String, // ~ 비밀번호

    account_bank: String, // 계좌 은행
    account_number: String, // 계좌 번호

    members_num: Number, // 구하려는 파티원 수 recruit_num 4인파티, 3인파티, 2인파티
    tag: [String],
    members: [String], // 문자열 배열 members.length == members_num [{type: String}]
    
    start_date: Date, // members_num이 max면 그 날이 시작
    end_date: Date,

    state: { // 파티 상태
        type: Boolean,
        default: false,
    },

    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],

    profile: [{ // ott 내 프로필 설정
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile'
        },
        nickname: String,
        name: String
    }],
});

let Party = mongoose.model("Party", PartySchema);
module.exports = Party; 