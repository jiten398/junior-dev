import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserForm = () => {
  const [name, setName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('');
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simulate saving the user information
    localStorage.setItem('userInfo', JSON.stringify({
      name,
      jobRole,
      jobDescription,
      programmingLanguage,
      resume
    }));

    // Navigate to the voice-to-code page
    navigate('/chat');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">User Information</h1>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
          <input
            type="text"
            placeholder="Job Role"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <textarea
            placeholder="Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
          <input
            type="text"
            placeholder="Programming Language"
            value={programmingLanguage}
            onChange={(e) => setProgrammingLanguage(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
          <input
            type="file"
            onChange={(e) => setResume(e.target.files[0])}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Save and Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
