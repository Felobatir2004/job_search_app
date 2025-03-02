import cron from 'node-cron';
import * as dbService from '../../DB/dbService.js';
import {UserModel} from '../../DB/Models/user.model.js';

const deleteExpiredOTPs = async () => {
  try {
    const now = new Date();
    await dbService.UpdateMany({
      model: UserModel,
      filter: { 'OTP.expiresIn': { $lt: now } },
      data: { $pull: { OTP: { expiresIn: { $lt: now } } } }
    });
    console.log('Expired OTPs deleted successfully');
  } catch (error) {
    console.error('Error deleting expired OTPs:', error.message);
  }
};

cron.schedule('0 */6 * * *', deleteExpiredOTPs);

export default deleteExpiredOTPs;
