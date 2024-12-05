const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, "webWatch");
        req.userData = decode

        if(req.userData.signupRole === 'Admin') {
            next();
        }else{
            throw new Error();
        }

    }catch(error){
        res.json({ success: false, message: "Unauthorized Access!!"})
    }
}