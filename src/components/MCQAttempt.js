import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import '../styles/MCQAttempt.css';
import SlButton from '@shoelace-style/shoelace/dist/react/button';

const MCQAttempt = () => {
  const { id } = useParams();
  const [mcq, setMcq] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMCQ = async () => {
      try {
        const mcqDoc = doc(firestore, 'mcqs', id);
        const mcqSnapshot = await getDoc(mcqDoc);
        if (mcqSnapshot.exists()) {
          setMcq(mcqSnapshot.data());
        } else {
          setError('MCQ not found');
        }
      } catch (error) {
        console.error("Error fetching MCQ: ", error);
        setError('Failed to load MCQ. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMCQ();
  }, [id]);

  const handleOptionChange = (optionId) => {
    console.log('Option changed:', optionId); // Log the option change
    setSelectedOptions((prevSelectedOptions) =>
      prevSelectedOptions.includes(optionId)
        ? prevSelectedOptions.filter((id) => id !== optionId)
        : [...prevSelectedOptions, optionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = auth.currentUser ? auth.currentUser.uid : null;
    const mcqId = id;
    const attemptedAt = new Date();

    // Log values before submission
    console.log('Submitting MCQ:', {
      userId,
      mcqId,
      selectedOptions,
      attemptedAt,
    });

    if (!userId || !mcqId || selectedOptions.includes(undefined) || !attemptedAt) {
      setError('All fields are required');
      console.error('Submission failed due to missing fields:', {
        userId,
        mcqId,
        selectedOptions,
        attemptedAt,
      });
      return;
    }

    try {
      const resultDoc = {
        userId,
        mcqId,
        selectedOptions,
        attemptedAt,
      };
      await addDoc(collection(firestore, 'results'), resultDoc);
      alert('MCQ submitted successfully!');
    } catch (error) {
      console.error("Error submitting MCQ: ", error);
      setError('Failed to submit MCQ. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="container mcq-attempt">
      <h1>{mcq.question}</h1>
      <form onSubmit={handleSubmit}>
        {mcq.options.map((option) => (
          <div key={option.optionId}>
            <input
              type="checkbox"
              value={option.optionId}
              onChange={() => handleOptionChange(option.optionId)}
            />
            {option.text}
          </div>
        ))} 
        <SlButton variant="warning" type="submit" disabled={loading}>
            Submit
        </SlButton>
      </form>
    </div>
  );
};

export default MCQAttempt;
