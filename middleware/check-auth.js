const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, "webWatch");
        req.userData = decode

        if(req.userData.signupRole === 'Admin' || req.userData.signupRole === 'Writer' || req.userData.signupRole === 'VoiceOver Artist/ Anchor' || req.userData.signupRole === 'Final Editor' || req.userData.signupRole === 'Raw Editor') {
            next();
        }else{
            throw new Error();
        }

    }catch(error){
        res.json({ success: false, message: "Unauthorized Access!!"})
    }
}