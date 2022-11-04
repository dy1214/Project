const express = require("express");
const passport = require("passport");
const multer = require("multer"); // 이미지, 동영상 파일 데이터 처리
const User = require("../models/User");
const Party = require("../models/Party");
const Payment = require("../models/Payment");
const router = express.Router();
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Review = require("../models/Review");
const Profile = require("../models/Profile");
dotenv.config();


/* 미들웨어 */
// 로그인 하지 않은 사용자를 체크하는 미들웨어 부분
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // 로그인 하지 않은 사용자라면
        return next();
    }
    req.flash("error", "You need to be logged in to do that!"); 
    res.redirect("/user/login"); 
};


/* 라우터 */

router.get("/", isLoggedIn, (req, res) => {
    res.render("users/index");
});


router.get("/user/register", (req, res) => {
    res.render("users/signup");
})

// 회원 가입
router.post("/user/register", (req, res) => {
    //console.log('success!');
    User.register(new User({
        username: req.body.username,
        name: req.body.name,
        //email: req.body.email
    }), req.body.password, function(err) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/user/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                console.log(req.user);
                req.flash("success", "success! you are registered and logged in");
                res.redirect("/user/login");
            })
        }
    })
});


// 로그인
router.get("/user/login", (req, res) => { // get 방식을 통해
    res.render("users/signin"); // views/users/login.ejs 파일을 렌더링 해주고
});

router.post( // post 방식을 통해 
    "/user/login",
    passport.authenticate("local", { // passport 인증을 수행
        successRedirect: "/", // 성공할 경우 / 페이지로
        failureRedirect: "/user/login"
    }),
    function(req, res) {
    }
);


// 로그아웃
router.get("/user/logout", (req, res) => {
    req.logout(function(err) {
        req.flash('success', "Goodbye");
        res.redirect('/');
    })
});


router.get("/user/main", isLoggedIn, (req, res) => {
    res.render("users/main");
});



// 유저(파티원) 카드 정보 등록
router.post("/user/payment", isLoggedIn, (req, res) => {
    let newPayment = {};
    newPayment.user_id = req.user._id;
    newPayment.card_num = req.body.card_num;
    newPayment.expiry = req.body.expiry;
    newPayment.birth = req.body.birth;
    newPayment.pwd_2digit = req.body.pwd_2digit;

    return createPayment(newPayment, req, res);
});

function createPayment(newPayment, req, res) {
    Payment.create(newPayment, (err, payment) => {
        if (err) {
            console.log(err);
        } else {
            req.user.pay_id = payment._id;
            //req.user.pay_id = req.body._id;
            req.user.save();
            console.log(payment);
            req.flash("success", "You created new payment");
            //res.redirect("/");
        }
    })
};



// my 프로필 조회
router.get("/user/:id/account/profile", isLoggedIn, (req, res) => { 
    User.findById(req.params.id) 
        .populate("party_id")
        .exec((err, user) => { 
            if (err) {
                console.log(err);
                req.flash("error", "error");
                res.redirect("back");
            } else {
                console.log(user);
                res.render("users/account-profile", { userData: user }); 
            }
        })
});

// my 파티 조회
router.get("/user/:id/account/party", isLoggedIn, (req, res) => { 
    User.findById(req.params.id) 
        .populate("pay_id") 
        .populate("party_id")
        .populate("review_id")
        .exec((err, user) => { // exec()로 user를 콜백으로 넘겨줌
            if (err) {
                console.log(err);
                req.flash("error", "error");
                res.redirect("back");
            } else {
                Party.findById(req.user.party_id).populate("reviews").exec((pErr, party) => {
                    if (pErr) {
                        console.log(pErr);
                        req.flash('err', 'err');
                        res.redirect('back');
                    } else {
                        console.log(party);
                        res.render("users/account-party", { userData: user, partyData: party });
                    }
                })
            }
        })
});

// my 결제 조회
router.get("/user/:id/account/payment", isLoggedIn, (req, res) => { 
    User.findById(req.params.id) 
        .populate("pay_id") 
        .exec((err, user) => { 
            if (err) {
                console.log(err);
                req.flash("error", "error");
                res.redirect("back");
            } else {
                console.log(user);
                res.render("users/account-payment", { userData: user });
            }
        })
});


router.get("/user/:id/myparty", isLoggedIn, (req, res) => { // 버튼 누르면 파티 결제 ?등 정보 보여주기
    // if 멤버수가 4명이면 나누기 4해서 그 결과를 user의 amount에 집어넣기
    // 시작 날짜, 끝 날짜 등록해서 넣기  router.post..?
    res.render("users/showpayment");
});


// 이메일 전송
router.post("/user/:id/account/email", isLoggedIn, (req, res) => {
    const { username, name } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GOOGLE_MAIL,
            pass: process.env.GOOGLE_PASSWORD
        },
    });
    User.findById(req.user._id, (userErr, user) => {
        if (userErr) {
            console.log(userErr);
            req.flash("err");
            res.redirect("back");
        } else {
            Party.findById(user.party_id, (pyErr, party) => {
                if (pyErr) {
                    console.log(pyErr);
                    req.flash("err");
                    res.redirect("back");
                } else {
                    const message = {
                        from: "findparty2022@gmail.com",
                        to: `${req.user.name}<${req.user.username}>`, // 받는 사람
                        subject: `[FIND] ${req.user.name}님의 파티 매칭이 완료되었습니다!`, // 제목
                        text: '', // 내용
                        html: `<style>
                                    @font-face{
                                    src: url("/fonts/GmarketSansMedium.otf");
                                    font-family: "Gsans"; 
                                    }
                            
                                    #GM_font{
                                    font-family: "Gsans";
                                    }
                                </style>
                                <div id='GM_font' style='text-align:center; width:100%; height:100%;'>
                                <h1>${req.user.name}님, OTT 이용을 위해 아래 파티장의 계좌로 금액을 입금해주세요!</h1><br>
                                
                                <h2>${party.account_bank}은행</h2>
                                <h2>${party.account_number}</h2>
                                <h2>입금할 금액: ${req.user.amount}원</h2>
                                
                                </div>
                            `,
                    };

                    transporter.sendMail(message, (err) => {
                        if (err) {
                            console.log(err);
                            req.flash("error", "error");
                            res.redirect("/")
                        } else {
                            req.flash("success", "Mail successed.");
                            res.redirect("/user/:id/account/profile");
                        }
                    })

                }
            })
        }
    })
   
});


// OTT에서 사용할 닉네임 설정
router.post('/user/:id/account/nickname/new', isLoggedIn, (req, res) => {
    Party.findById(req.user.party_id, (err, party) => {
        if (err) {
            console.log(err);
            req.flash('error', 'error');
            res.redirect('back');
        } else {
            Profile.create({ nickname: req.body.nickname }, (err, profile) => {
                if (err) {
                    console.log(err);
                    req.flash('error', 'error');
                    res.redirect('back');
                } else {
                    console.log(profile);
                    profile.user_id = req.user._id;
                    profile.party_id = party._id;
                    profile.save();

                    party.profile._id = profile._id;
                    party.profile.name = req.user.name;
                    party.profile.nickname = req.body.nickname;
                    party.profile.push(profile);
                    party.save();

                    req.user.profile_id.push(profile._id);
                    req.user.save();

                    req.flash('success', 'success');
                    res.redirect(`/user/${req.user._id}/account/party`);
                }
            })
        }
    })
})





// params 주소에 포함된 변수 , body 폼 , query 주소 바깥의 ?이후의 변수
// 파티 리뷰글 생성
router.post('/user/:id/account/review', isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) {
            console.log(err);
            req.flash('error','error');
            res.redirect('back');
        } else {
            Party.findById(user.party_id, (pErr, party) => {
                if (pErr) {
                    console.log(pErr);
                    req.flash('error','error');
                    res.redirect('back');
                } else {
                    Review.create({ title: req.body.title, content: req.body.content, rating: req.body.rating }, (err, review) => {
                        if (err) {
                            console.log(err);
                            req.flash('error', 'error');
                            res.redirect('back');
                        } else {
                            //req.user.review_id = review._id;
                            req.user.review_id.push(review._id);
                            review.user_id = req.user._id;
                            review.party_id = req.user.party_id;
                            req.user.save();
                            review.save();
                            party.reviews.push(review);
                            party.save();
                            console.log(review);
                            req.flash('success', 'Successfully');
                            res.redirect("back");
                        }
                    })
                }
            })
        }
    })
    
});



// 리뷰 삭제
router.delete('/:reviewId', isLoggedIn, (req, res) => {
    const { id, reviewId } = req.params;
    Party.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
    Review.findByIdAndDelete(reviewId);
    req.flash('success', 'success');
    res.redirect('/');
});





/* ====== */

// 마지막으로 결제 api


router.post("/settlement", isLoggedIn, (req, res) => {


}); // 정산일 등록, 시작날짜 끝 날짜도


router.delete("/", isLoggedIn, (req, res) => { // 탈퇴

});




module.exports = router;