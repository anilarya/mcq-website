import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/UserDashboard.css'; // Import the CSS file

const UserDashboard = () => {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  const handleMCQClick = (id) => {
    navigate(`/mcq/${id}`);
  };

  return (
    <div className="container user-dashboard">
      <h1>User Dashboard</h1>
      <h2>Available MCQs</h2>
      <ul>
        {mcqs.map(mcq => (
          <li key={mcq.id} onClick={() => handleMCQClick(mcq.id)} className="mcq-item">
            <h3>{mcq.question}</h3>
            <ul>
              {mcq.options.map((option, index) => (
                <li key={index}>{option.text}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
