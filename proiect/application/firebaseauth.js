require('dotenv').config({ path: './.env' });
process.env.GOOGLE_APPLICATION_CREDENTIALS =
  'credentials/disco-dispatch-307814-e2b5024e384a.json';
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});

module.exports.verifyUserToken = async (idToken, userid) => {
    return admin.auth().verifyIdToken(idToken).then((decodedToken) => {
        const uid = decodedToken.uid;
        if(uid == userid){
            return true;
        }
    }).catch((error) => {
        console.log(`Token verification error: ${error}`);
        return false;
    });
};