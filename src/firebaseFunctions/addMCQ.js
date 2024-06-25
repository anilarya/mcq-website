import { collection, addDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebase';

const addMCQ = async (question, options) => {
  await addDoc(collection(firestore, 'mcqs'), {
    question,
    options,
    createdBy: auth.currentUser.uid,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export default addMCQ;
