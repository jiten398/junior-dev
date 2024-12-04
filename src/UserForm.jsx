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
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Name" onChange={handleInputChange} />
      <input type="text" name="jobRole" placeholder="Job Role" onChange={handleInputChange} />
      <textarea name="jobDescription" placeholder="Job Description" onChange={handleInputChange} />
      <input type="text" name="programmingLanguage" placeholder="Programming Language" onChange={handleInputChange} />
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Submit</button>
    </form>
  );
};

export default UserForm;
