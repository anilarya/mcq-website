import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { CSVLink } from 'react-csv';
import '../styles/ResultsPage.css';
// import SlButton from '@shoelace-style/shoelace/dist/react/button';

const ResultsPage = () => {
  const [groupedResults, setGroupedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const resultsCollection = collection(firestore, 'results');
        const resultsSnapshot = await getDocs(resultsCollection);
        const resultsData = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

        const groupedData = resultsData.reduce((acc, result) => {
          const mcq = mcqsData[result.mcqId];
          const user = usersData[result.userId];
          const correct = mcq ? mcq.options.find(option => option.optionId === result.selectedOptionId).isCorrect : false;

          const resultWithDetails = {
            ...result,
            userName: user ? user.name : 'Unknown',
            userEmail: user ? user.email : 'Unknown',
            correct: correct ? 'Correct' : 'Incorrect',
          };

          if (!acc[result.userId]) {
            acc[result.userId] = {
              userName: resultWithDetails.userName,
              userEmail: resultWithDetails.userEmail,
              correctCount: 0,
              results: [],
            };
          }

          if (correct) {
            acc[result.userId].correctCount += 1;
          }

          acc[result.userId].results.push(resultWithDetails);
          return acc;
        }, {});

        const sortedGroupedData = Object.values(groupedData).sort((a, b) => b.correctCount - a.correctCount);

        setGroupedResults(sortedGroupedData);

        const csv = [];
        csv.push(['User Name', 'Email', 'MCQ ID', 'Selected Option', 'Correct/Incorrect', 'Attempted At']);
        sortedGroupedData.forEach(userResults => {
          userResults.results.forEach(result => {
            csv.push([
              userResults.userName,
              userResults.userEmail,
              result.mcqId,
              result.selectedOptionId,
              result.correct,
              new Date(result.attemptedAt.seconds * 1000).toLocaleString()
            ]);
          });
        });

        setCsvData(csv);
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
      <CSVLink data={csvData} filename="results.csv" className="btn btn-secondary" target="_blank">
      <h2><div className='text-color'>Download Results as CSV</div></h2>
      </CSVLink> 
      {groupedResults.map((userResults, index) => (
        <div key={index} className="user-results">
          <h2>{userResults.userName} ({userResults.userEmail})</h2>
          <h3>Total Correct Answers: {userResults.correctCount}</h3>
          <table>
            <thead>
              <tr>
                <th>MCQ ID</th>
                <th>Answer</th>
                <th>Correct/Incorrect</th>
                <th>Attempted At</th>
              </tr>
            </thead>
            <tbody>
              {userResults.results.map((result, index) => (
                <tr key={index}>
                  <td>{result.mcqId}</td>
                  <td>{result.selectedOptionId}</td>
                  <td>{result.correct}</td>
                  <td>{new Date(result.attemptedAt.seconds * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ResultsPage;
