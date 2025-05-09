// src/components/SignupForm.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/verify",
      },
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Check your email for a verification link.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleSignup}>Sign Up</button>
      {message && <p>{message}</p>}
    </div>
  );
}
