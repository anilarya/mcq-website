import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import '../styles/UserDashboard.css';
import SlButton from '@shoelace-style/shoelace/dist/react/button';
// import SlRadio from '@shoelace-style/shoelace/dist/react/radio';
const UserDashboard = () => {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const fetchMCQs = async () => {
      try {
        const mcqCollection = collection(firestore, 'mcqs');
        const mcqSnapshot = await getDocs(mcqCollection);
        setMcqs(mcqSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching MCQs: ", error);
        setError('Failed to load MCQs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMCQs();
  }, []);

  const handleOptionChange = (mcqId, optionId) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [mcqId]: prevResponses[mcqId] === optionId ? null : optionId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userEmail = auth.currentUser ? auth.currentUser.email : null;
    const attemptedAt = new Date();

    if (!userId || !userEmail) {
      setError('User not authenticated.');
      return;
    }

    try {
      for (const [mcqId, selectedOptionId] of Object.entries(responses)) {
        if (selectedOptionId !== null) {
          const q = query(collection(firestore, 'results'), where('userId', '==', userId), where('mcqId', '==', mcqId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await setDoc(docRef, { selectedOptionId, attemptedAt }, { merge: true });
          } else {
            const resultDocRef = doc(collection(firestore, 'results'));
            await setDoc(resultDocRef, { userId, email: userEmail, mcqId, selectedOptionId, attemptedAt });
          }
        }
      }
      alert('Responses submitted successfully!');
    } catch (error) {
      console.error("Error submitting responses: ", error);
      setError('Failed to submit responses. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="container user-dashboard">
      <h1>User Dashboard</h1>
      <form onSubmit={handleSubmit}>
        {mcqs.map(mcq => (
          <div key={mcq.id} className="mcq-item">
            <h3>{mcq.question}</h3>
            <ul>
              {mcq.options.map((option, index) => (
                <li key={option.optionId}>
                  <label>
                    <input
                      type="radio"
                      name={`mcq-${mcq.id}`}
                      value={option.optionId}
                      checked={responses[mcq.id] === option.optionId}
                      onChange={() => handleOptionChange(mcq.id, option.optionId)}
                    />
                    {option.text}
                  </label>

                  {/* <SlRadio name={`mcq-${mcq.id}`}
                    value={option.optionId}
                    checked={responses[mcq.id] === option.optionId}
                    onChange={() => handleOptionChange(mcq.id, option.optionId)}
                  >
                    {option.text}
                 </SlRadio> */}
                </li>
              ))}
            </ul>
          </div>
        ))} 
        <SlButton variant="warning" type="submit" disabled={loading}>
            Submit All
        </SlButton>
      </form>
    </div>
  );
};

export default UserDashboard;
