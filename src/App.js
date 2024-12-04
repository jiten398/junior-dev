import { supabase } from './supabase';
import React, { useState } from 'react';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const handleLogin = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('Check your email for the login link!');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
    setSession(null);
  };

  if (!session) {
    return (
      <div>
        <h1>Login</h1>
        <input type="email" placeholder="Enter your email" id="email" />
        <button onClick={() => handleLogin(document.getElementById('email').value)}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <p>Welcome, {session.user.email}</p>
    </div>
  );
}

export default App;
