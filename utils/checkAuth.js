// Imports
import jwt from 'jsonwebtoken';





// Check token functions
const checkAuth = req => {
    const authHeader = req.headers.authorization;
    if(authHeader){
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const user = jwt.verify(token, process.env.SECRET_JWT_KEY);
          return user;
        } catch (err) {
          throw new Error('Invalid/Expired token.');
        }
      }
      throw new Error("Authentication token form must be 'Bearer [token]");
    }
    throw new Error('Authorization header must be provided.');
};





// Export
export default checkAuth;