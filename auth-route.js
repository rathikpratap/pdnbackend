const router = require('express').Router();

const User = require('./models/user');


const jwt = require('jsonwebtoken');
const checkAuth = require('./middleware/check-auth');


router.post('/login', (req,res)=>{
    User.findOne({ signupUsername: req.body.loginUsername}).exec().then(user =>{
        if(!user){
            return res.json({ success: false, message: "User not found"});
        }
        if(req.body.loginPswd === user.signupPassword){
            const payload = {
                userId: user._id,
                name: user.signupUsername,
                signupRole: user.signupRole
            };
            const token = jwt.sign(payload, "webWatch", {expiresIn: '8h'});
            console.log("PAYLOAD DATA====>", payload);
            user.save().then(()=>{
                return res.json({
                    success: true,
                    token: token,
                    role: user.signupRole,
                    message: "login Successfull"
                });
            }).catch(err =>{
                console.error("Error saving login  time: ", err);
                return res.json({ success: false, message: "FALSE FALSE FALSE"});
            });
        }else{
            return res.json({ success: false, message: "Password not matched"});
        }
    }).catch(err =>{
        res.json({success: false, message: "Authentication Failed"});
    });
});

router.get('/profile', checkAuth, async( req,res)=>{
    const userId = await req.userData.userId;

    console.log("USER USER===>", userId);

    User.findById(userId).exec().then((result)=>{
        return res.json({ success: true, data: result})
    }).catch(err =>{
        res.json({ success: false, mesage: "Server Error"})
    })
});

module.exports = router