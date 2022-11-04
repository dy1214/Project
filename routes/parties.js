const express = require("express");
const passport = require("passport");
const multer = require("multer"); // 이미지, 동영상 파일 데이터 처리
const User = require("../models/User");
const Party = require("../models/Party");
const Payment = require("../models/Payment");
const Ott = require("../models/OTT");
const Review = require("../models/Review");
//const UserParty = require("../models/UserParty");
const router = express.Router();



/* 미들웨어 */
// 로그인 하지 않은 사용자를 체크하는 미들웨어 부분
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // 로그인 하지 않은 사용자라면
        return next();
    }
    req.flash("error", "You need to be logged in to do that!"); 
    res.redirect("/user/login");
};





/* ====== */

/*
router.get("/parties/index", (req, res) => { // populate?
    let showparties = Party.find({}).populate('popupText');
    res.render("parties/index", { showparties })
}) // 전체 파티 조회 */


router.get("/parties/new", isLoggedIn, (req, res) => { 
    res.render("parties/new2"); 
}) // 새 파티 만들기 render

router.post("/parties/new", isLoggedIn, (req, res) => { 
    if (req.body.ott_name && req.body.owner_id && req.body.owner_password && req.body.account_bank && req.body.account_number && req.body.members_num) {
        let newParty = {}; 
        //newParty.ott_id = null;
        newParty.author = req.user._id;
        //newParty.author.push(req.user._id);
        newParty.ott_name = req.body.ott_name;
        newParty.owner_id = req.body.owner_id;
        newParty.owner_password = req.body.owner_password;
        newParty.account_bank = req.body.account_bank;
        newParty.account_number = req.body.account_number;
        newParty.members_num = req.body.members_num; // ex 4인 파티, 3인 파티

        newParty.tag = req.body.tag;
    
        newParty.members = req.user.name;
        newParty.start_date = null;
        newParty.end_date = null;

        return createParty(newParty, req, res); 
    }
}); // 파티 만들기

function createParty(newParty, req, res) {
    Party.create(newParty, (err, party) => {
        if (err) {
            console.log(err);
        } else {
            req.user.party_id.push(party._id);
            req.user.save();
            console.log(party);
            req.flash('success', 'Successfully made a new party');
            res.redirect("/");
        }
        addOTT(party);
    });
} // createParty() 함수



function addOTT(party) {
    Ott.find({ name: party.ott_name }, function(err, ottname) {
        if (err) {
            console.log(err);
        } else {
            console.log(ottname);
            Ott.findById(ottname, function(err, ottid) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log(ottid._id);
                    party.ott_id = ottid._id;
                    //console.log(party.ott_id);
                    party.save();
                }
            });
        }
    });
}


router.get("/parties/all", isLoggedIn, (req, res) => {
    Party.find().exec((err, party) => {
        if (err) {
            console.log(err);
            req.flash("err", "There has been an error finding all parties.");
            res.render("parties/parties2");
        } else {
            let parties = [];
            for (var i = 0; i < party.length; i++) {
                parties.push(party[i]);
            }

            if (parties) {
                res.render("parties/parties2", {parties: parties});
            } else {
                res.render("parties/parties2", {parties: null});
            }
        }
    });
}); // 전체 파티 조회



router.get("/parties/:id/join", isLoggedIn, (req, res) => {
    User.findById(req.user._id, (usererr, user) => {
        if (usererr) {
            console.log(usererr);
            req.flash("error", "There has been an error joining the party..");
            res.redirect("back");
        } else { // $nin 
            Party.findById(req.params.id, (partyerr, party) => {
                if (partyerr) {
                    console.log(partyerr);
                    req.flash("error");
                    res.redirect("back");
                } else {
                    /* 차라리 .ejs에서 party_id 있으면 창이 안뜨게 하기
                    if (User.findOne({_id: req.user._id})
                            .populate('party_id', { $ne: null })) {
                                req.flash( "error", "You have already join the party!");
                                return res.redirect("back");
                            }*/
                
                    user.party_id.push(req.params.id);
                    Party.findByIdAndUpdate(req.params.id, { $push: { members: req.user.name }}).exec();

                    Ott.findById(party.ott_id, (err, ott) => {
                        if (err) {
                            console.log(err);
                        } else {
                            //console.log(ott);
                            //console.log(ott.price);
                            user.amount = user.amount + (ott.price / party.members_num);
                            user.save();
                        }
                    })
                    req.flash("success", "You successfully joined the party");
                    res.redirect("/");  
                }
            })
        }
    })
}); // 파티 가입
// 가입 버튼 누르면 카드 정보 입력하라는 모달 창 뜨게 




router.delete("/parties/:id", isLoggedIn, (req, res) => {
    const { id } = req.params;
    Party.findByIdAndDelete(id);
    req.flash('success', "successfully deleted");
    return res.redirect("/");
}); // 파티 삭제 수정하기










/* ====== */
//ott();

// 프리미엄(4인 동시시청 가능) 가격
async function ott() {
    const ott1 = new OTT({
        name: '넷플릭스',
        price: 17000
    })
    const ott2 = new OTT({
        name: '티빙',
        price: 13900
    })
    const ott3 = new OTT({
        name: '웨이브',
        price: 13900
    })
    const ott4 = new OTT({
        name: '디즈니플러스',
        price: 9900
    })
    const otts = [ott1, ott2, ott3, ott4];
    try {
        await Ott.insertMany(otts);
    } catch (e) {
        console.log(e);
    }
};






// 파티 시작됐을 때 메일링 보내기
// 인원 꽉차면 -> 그 날이 파티 시작 날짜 파티 시작날짜랑 끝나는 날짜 정하기 +30해서 끝나는ㄴ날짜로 저장
// 결제 기능



router.patch("/ott", isLoggedIn, (req, res) => {

}); // 정보 변경





module.exports = router;