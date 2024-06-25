import { collection, addDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase';

const addResult = async (mcqId, selectedOptions, score) => {
  await addDoc(collection(firestore, 'results'), {
    userId: auth.currentUser.uid,
    mcqId,
    selectedOptions,
    score,
    attemptedAt: new Date()
  });
};

export default addResult;
