import React, { useState, useEffect } from 'react';
import { collection, getDocs  } from 'firebase/firestore';
import { firestore } from '../firebase';
import '../styles/ResultsPage.css';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const resultsCollection = collection(firestore, 'results');
        const resultsSnapshot = await getDocs(resultsCollection);
        const resultsData = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch all MCQs and Users data
        const mcqsCollection = collection(firestore, 'mcqs');
        const mcqsSnapshot = await getDocs(mcqsCollection);
        const mcqsData = mcqsSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        // Merge results with user and MCQ data
        const mergedResults = resultsData.map(result => {
          const mcq = mcqsData[result.mcqId];
          const user = usersData[result.userId];
          const correct = mcq ? mcq.options.find(option => option.optionId === result.selectedOptionId).isCorrect : false;

          return {
            ...result,
            userName: user ? user.name : 'Unknown',
            userEmail : user ? user.email: "NA",
            correct: correct ? 'Correct' : 'Incorrect',
          };
        });

        setResults(mergedResults);
      } catch (error) {
        console.error("Error fetching results: ", error);
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="container results-page">
      <h1>Results</h1>
      <table>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>MCQ ID</th>
            <th>Answer</th>
            <th>Correct/Incorrect</th>
            <th>Attempted At</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.userName}</td>
              <td>{result.userEmail}</td>
              <td>{result.mcqId}</td>
              <td>{result.selectedOptionId}</td>
              <td>{result.correct}</td>
              <td>{new Date(result.attemptedAt.seconds * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsPage;
