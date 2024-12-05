import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { supabase } from './supabase';
import UserForm from './UserForm';
import VoiceCodeGenerator from './Agent';

function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert(error.message);
    } else {
      alert('Check your email for the login link!');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    }
    setSession(null);
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Login</h1>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-200"
          >
            {loading ? 'Sending...' : 'Login'}
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account? <span className="text-blue-600 cursor-pointer">Sign Up</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600">
        {/* Topbar */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between fixed top-0 left-0 w-full">
          <p className="text-gray-700">
            Logged in as <span className="font-medium">{session.user.email}</span>
          </p>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition duration-200"
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {/* Routes */}
        <div className="pt-16">
          <Routes>
            <Route path="/" element={<UserForm />} />
            <Route path="/chat" element={<VoiceCodeGenerator />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
