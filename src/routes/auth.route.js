import express from 'express';
import { signup ,verifyEmail,checkAuth, login, logout} from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { checkBan } from '../middlewares/checkBan.middleware.js';

const authRouter = express.Router();
authRouter.get("/check-auth", verifyToken, checkAuth);

authRouter.post('/login',checkBan, login);
authRouter.get('/logout',logout);
  


authRouter.post('/signup', signup);
authRouter.get('/verify-email', verifyEmail);

/*authRouter.post("/forgot-password", forgotPassword);

authRouter.post("/reset-password/:token", resetPassword);*/

export default authRouter;