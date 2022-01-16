const jwt = require('jsonwebtoken');
// ============================================================================
// ** middleware for checking user
function auth(req, res, next) {
    // check access toke was provided
    let message;
    const token = req.header("x-auth-token");
    if (!token){
      message = {
        message: "Access denied. No token provide."
      };
      return res.status(403).send(message);
    }
    // verify token, if ok then continue else send error
    try {
      const decoded = jwt.verify(token, process.env.JWTKEY);
      req.user = decoded.user;
      req.userId = decoded.userId;
      next();
    }catch(error){
      message = {
        message: "Access denied. Invalid token."
      };
      return res.status(403).send(message);
    }
}

module.exports = auth;
