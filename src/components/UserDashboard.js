import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import '../styles/UserDashboard.css';

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
    const attemptedAt = new Date();

    if (!userId) {
      setError('User not authenticated.');
      return;
    }

    const results = Object.entries(responses).map(([mcqId, selectedOptionId]) => ({
      mcqId,
      selectedOptionId,
      userId,
      attemptedAt,
    }));

    try {
      const batch = writeBatch(firestore);
      results.forEach(result => {
        const resultRef = doc(collection(firestore, 'results'));
        batch.set(resultRef, result);
      });
      await batch.commit();
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
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button type="submit">Submit All</button>
      </form>
    </div>
  );
};

export default UserDashboard;
