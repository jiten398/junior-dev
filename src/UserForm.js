import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import * as pdfjsLib from 'pdfjs-dist';

const UserForm = () => {
  const [name, setName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const extractTextFromPDF = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      setResumeText(text);  // Set extracted text to state
    };
    reader.readAsArrayBuffer(file);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    setResume(file);
    
    if (file.type === 'application/pdf') {
      extractTextFromPDF(file);
    } else {
      alert('Only PDF files are supported for analysis.');
    }
  };

  const extractResumeData = (text) => {
    // Regex to match experience, education, and projects sections
    const experienceRegex = /(experience|work\s*history|professional\s*experience)[\s\S]*?(?=(education|projects|skills|$))/i;
    const educationRegex = /(education)[\s\S]*?(?=(experience|projects|skills|$))/i;
    const projectsRegex = /(projects)[\s\S]*?(?=(experience|education|skills|$))/i;

    // Extract data from the text
    const experience = text.match(experienceRegex) ? text.match(experienceRegex)[0] : '';
    const education = text.match(educationRegex) ? text.match(educationRegex)[0] : '';
    const projects = text.match(projectsRegex) ? text.match(projectsRegex)[0] : '';

    return {
      experience: experience.trim(),
      education: education.trim(),
      projects: projects.trim(),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // If a resume is uploaded, upload it to Supabase Storage
    let resumeUrl = null;
    if (resume) {
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(`public/${resume.name}`, resume);

      if (error) {
        alert("Error uploading resume");
        setLoading(false);
        return;
      }

      // Get the public URL of the uploaded file
      resumeUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/resumes/${data.path}`;
    }

    // Extract relevant sections from the resume text
    const { experience, education, projects } = extractResumeData(resumeText);

    // Save user data to Supabase database
    const { error } = await supabase
      .from('users')
      .insert([
        {
          name,
          job_role: jobRole,
          job_description: jobDescription,
          programming_language: programmingLanguage,
          resume_url: resumeUrl,
          experience,
          education,
          projects,
        }
      ]);

    if (error) {
      alert("Error saving user data");
    } else {
      // Navigate to the next page (e.g., voice-to-code page)
      navigate('/chat');
    }

    setLoading(false);
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
            onChange={handleResumeUpload}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Display Extracted Text */}
          {resumeText && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Extracted Resume Data:</h3>
              <pre className="text-sm text-gray-700">
                {`Experience:\n${resumeText.experience}\n\nEducation:\n${resumeText.education}\n\nProjects:\n${resumeText.projects}`}
              </pre>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
          >
            {loading ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
