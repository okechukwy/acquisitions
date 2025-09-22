import logger from '#config/logger.js';
import { ne } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-please-change-in-production';
const JWT_EXPIRES_IN = '1d';


export const jwttoken = {

    sign: (payload) => {
        try{
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        }catch(e){

            logger.error('failed to authenticate token', e);
            throw new Error('failed to authenticate token');

        }
    },

    verify: (token) => {

        try {
            return jwt.verify(token, JWT_SECRET);

        }catch (e) {

            logger.error('failed to authenticate token', e);
            throw new Error('failed to authenticate token');

        }
    }


}






// export const jwttoken = {
//   sign: (payload) => {

//     try{
//       return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });    

//     }catch(errors){
//       logger.error('failed to authenticate token', errors);
//       throw new Error('failed to authenticate token');

//     }
//   },

//   verify: (token) => {
//     try{
//       return jwt.verify(token, JWT_SECRET);

//     }catch(error){
//       logger.error('failed to authenticate token', errors);
//       throw new Error('failed to authenticate token');

//     }
//   }
// };