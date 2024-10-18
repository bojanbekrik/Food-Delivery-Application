import * as admin from 'firebase-admin';
import * as serviceAccount from './firebase-config.json'
console.log(serviceAccount);
export const firebaseConfig = () => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        databaseURL: 'https://fooddeliveryapp-8becf.firebaseio.com',
    });
    return admin.firestore();
};


