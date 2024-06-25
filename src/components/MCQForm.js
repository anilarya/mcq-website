import React, { useState, useEffect } from 'react'; 
import {  auth } from '../firebase';
import '../styles/MCQForm.css';

const MCQForm = ({ onSubmit, initialData }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { optionId: '1', text: '', isCorrect: false },
    { optionId: '2', text: '', isCorrect: false },
    { optionId: '3', text: '', isCorrect: false },
    { optionId: '4', text: '', isCorrect: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question);
      setOptions(initialData.options);
    }
  }, [initialData]);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (question.trim() === '' || options.some(option => option.text.trim() === '')) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const mcqDoc = {
      question,
      options,
      createdBy: initialData ? initialData.createdBy : auth.currentUser.uid,
      createdAt: initialData ? initialData.createdAt : new Date(),
      updatedAt: new Date(),
    };

    try {
      await onSubmit(mcqDoc);
      setQuestion('');
      setOptions([
        { optionId: '1', text: '', isCorrect: false },
        { optionId: '2', text: '', isCorrect: false },
        { optionId: '3', text: '', isCorrect: false },
        { optionId: '4', text: '', isCorrect: false },
      ]);
      alert(`MCQ ${initialData ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error(`Error ${initialData ? 'updating' : 'creating'} MCQ: `, error);
      setError(`Failed to ${initialData ? 'update' : 'create'} MCQ. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mcq-form">
      <h1>{initialData ? 'Edit MCQ' : 'Create MCQ'}</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          required
        />
        {options.map((option, index) => (
          <div key={option.optionId}>
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
            />
            <label>
              <input
                type="checkbox"
                checked={option.isCorrect}
                onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
              />
              Correct
            </label>
          </div>
        ))}
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : initialData ? 'Update MCQ' : 'Create MCQ'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default MCQForm;
