import React, { useState } from 'react';
import UserForm from './UserForm';
import VoiceCodeGenerator from './Agent';
import { supabase } from './supabase';

function App() {
  const [session, setSession] = useState(null);
  const [isFormComplete, setIsFormComplete] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const handleFormSubmit = () => setIsFormComplete(true);

  if (!session) {
    return (
      <div>
        <h1>Login</h1>
        <input type="email" placeholder="Enter your email" id="email" />
        <button onClick={() => supabase.auth.signInWithOtp({ email: document.getElementById('email').value })}>
          Login
        </button>
      </div>
    );
  }

  if (!isFormComplete) {
    return <UserForm onSubmit={handleFormSubmit} />;
  }

  return <VoiceCodeGenerator />;
}

export default App;
