import React, { useState } from 'react';
import { supabase } from './supabase';

const UserForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    jobRole: '',
    jobDescription: '',
    programmingLanguage: '',
    resume: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, resume: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload resume to Supabase storage
    let resumeUrl = '';
    if (formData.resume) {
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(`public/${formData.resume.name}`, formData.resume);

      if (error) {
        console.error('Error uploading resume:', error.message);
        return;
      }
      resumeUrl = data.path;
    }

    // Insert user details into the database
    const { error } = await supabase.from('users').insert({
      name: formData.name,
      job_role: formData.jobRole,
      job_description: formData.jobDescription,
      programming_language: formData.programmingLanguage,
      resume_url: resumeUrl,
    });

    if (error) {
      console.error('Error saving user data:', error.message);
    } else {
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg space-y-6"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">User Details Form</h2>
      
      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          onChange={handleInputChange}
          className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Job Role Input */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Job Role</label>
        <input
          type="text"
          name="jobRole"
          placeholder="Enter your job role"
          onChange={handleInputChange}
          className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Job Description Input */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Job Description</label>
        <textarea
          name="jobDescription"
          placeholder="Describe your job responsibilities"
          onChange={handleInputChange}
          rows="4"
          className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>
      </div>

      {/* Programming Language Input */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Programming Language</label>
        <input
          type="text"
          name="programmingLanguage"
          placeholder="Enter your preferred programming language"
          onChange={handleInputChange}
          className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Resume Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Upload Resume</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full mt-2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
      >
        Submit
      </button>
    </form>
  );
};

export default UserForm;
