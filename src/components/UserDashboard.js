import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import '../styles/UserDashboard.css'; 
import SlButton from '@shoelace-style/shoelace/dist/react/button';
import SlSpinner from '@shoelace-style/shoelace/dist/react/spinner';

const UserDashboard = () => {
  const [mcqs, setMcqs] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    setIsSubmitting(true);

    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const userEmail = auth.currentUser ? auth.currentUser.email : null;
    const attemptedAt = new Date();

    if (!userId || !userEmail) {
      setError('User not authenticated.');
      setIsSubmitting(false);
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
      navigate('/thank-you');
    } catch (error) {
      console.error("Error submitting responses: ", error);
      setError('Failed to submit responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % mcqs.length);
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prevIndex) => (prevIndex - 1 + mcqs.length) % mcqs.length);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  const currentMcq = mcqs[currentQuestionIndex];

  return (
    <div className="container user-dashboard">
      <h1>User Dashboard</h1>
      <form onSubmit={handleSubmit}>
        {currentMcq && (
          <div key={currentMcq.id} className="mcq-item">
            <h3>{currentMcq.question}</h3>
            <ul>
              {currentMcq.options.map((option, index) => (
                <li key={option.optionId}>
                  <label>
                    <input
                      type="radio"
                      name={`mcq-${currentMcq.id}`}
                      value={option.optionId}
                      checked={responses[currentMcq.id] === option.optionId}
                      onChange={() => handleOptionChange(currentMcq.id, option.optionId)}
                    />
                    {option.text}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="navigation-buttons">
          <SlButton variant="warning" type="button" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            Previous
          </SlButton>
          {currentQuestionIndex < mcqs.length - 1 ? (
            <SlButton variant="warning" type="button" onClick={handleNext}>
              Next
            </SlButton>
          ) : (
            <SlButton variant="danger" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <SlSpinner></SlSpinner>

: ''}        Submit
            </SlButton>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserDashboard;
