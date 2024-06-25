import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import MCQForm from './MCQForm';
import '../styles/AdminDashboard.css';
import SlButton from '@shoelace-style/shoelace/dist/react/button';

const AdminDashboard = () => {
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMCQ, setEditMCQ] = useState(null);

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

  const handleAdd = async (mcqDoc) => {
    try {
      const docRef = await addDoc(collection(firestore, 'mcqs'), mcqDoc);
      setMcqs([...mcqs, { id: docRef.id, ...mcqDoc }]);
      alert('MCQ created successfully!');
    } catch (error) {
      console.error("Error creating MCQ: ", error);
      setError('Failed to create MCQ. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'mcqs', id));
      setMcqs(mcqs.filter(mcq => mcq.id !== id));
      alert('MCQ deleted successfully!');
    } catch (error) {
      console.error("Error deleting MCQ: ", error);
      setError('Failed to delete MCQ. Please try again.');
    }
  };

  const handleEdit = (mcq) => {
    setEditMCQ(mcq);
  };

  const handleUpdate = async (id, updatedMCQ) => {
    try {
      await updateDoc(doc(firestore, 'mcqs', id), updatedMCQ);
      setMcqs(mcqs.map(mcq => (mcq.id === id ? { id, ...updatedMCQ } : mcq)));
      setEditMCQ(null);
      alert('MCQ updated successfully!');
    } catch (error) {
      console.error("Error updating MCQ: ", error);
      setError('Failed to update MCQ. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="container admin-dashboard">
      <h1>Admin Dashboard</h1>
      <MCQForm onSubmit={editMCQ ? (mcqDoc) => handleUpdate(editMCQ.id, mcqDoc) : handleAdd} initialData={editMCQ} />
      <h2>MCQs</h2>
      <ul>
        {mcqs.map(mcq => (
          <li key={mcq.id}>
            <h3>{mcq.question}</h3>
            <ul>
              {mcq.options.map((option, index) => (
                <li key={index}>
                  {option.text} {option.isCorrect && <strong>(Correct)</strong>}
                </li>
              ))}
            </ul>
             
            <div style={{ display: 'flex', gap: '10px' }}>
                <SlButton variant="warning" onClick={() => handleEdit(mcq)}>
                    Edit
                </SlButton>

                <SlButton variant="warning" onClick={() => handleDelete(mcq.id)}>
                    Delete
                </SlButton>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
