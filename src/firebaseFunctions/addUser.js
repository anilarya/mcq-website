import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

const addUser = async (user) => {
  const userDoc = doc(firestore, 'users', user.uid);
  await setDoc(userDoc, {
    userId: user.uid,
    role: user.email === 'anilarya280@gmail.com' ? 'admin' : 'user',
    email: user.email,
    createdAt: new Date()
  });
};

export default addUser;
