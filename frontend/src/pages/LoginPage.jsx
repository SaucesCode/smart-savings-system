import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
    // Google redirects automatically — no navigate() needed
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "0 16px" }}>
      <h2>{isSignUp ? "Create an account" : "Sign in"}</h2>

      {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

      <form onSubmit={handleEmailAuth}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        >
          {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <button onClick={handleGoogle} style={{ width: "100%", padding: 10, marginBottom: 16 }}>
        Continue with Google
      </button>

      <p style={{ textAlign: "center" }}>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <span
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ color: "blue", cursor: "pointer" }}
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </span>
      </p>
    </div>
  );
}
