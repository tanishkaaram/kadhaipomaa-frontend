import { useState } from "react";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  auth,
  googleProvider
} from "../firebase";

function Login({ setUser, setGuestMode }) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isSignup, setIsSignup] =
    useState(false);

  const googleLogin = async () => {

    try {

      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );

      setUser(result.user);

    } catch (err) {

      alert(err.message);

    }

  };

  const emailAuth = async () => {

    try {

      let result;

      if (isSignup) {

        result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

      } else {

        result =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

      }

      setUser(result.user);

    } catch (err) {

      alert(err.message);

    }

  };

const [showEmailModal, setShowEmailModal] = useState(false);

return (
  <div className="login-screen">

    <div className="login-card">

      <h1 className="logo">
        Kadhaipomaa
      </h1>

      <p className="subtitle">
        Meet strangers. Stay anonymous.
      </p>

      <button
        className="start-btn"
        onClick={() => setGuestMode(true)}
      >
        👤 Stay Anonymous
      </button>

      <button
        className="secondary-btn"
        onClick={googleLogin}
      >
        🔵 Continue with Google
      </button>

      <button
        className="secondary-btn"
        onClick={() => setShowEmailModal(true)}
      >
        📧 Continue with Email
      </button>

    </div>

    {showEmailModal && (
      <div className="modal-overlay">

        <div className="modal">

          <h2>
            Login
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button
            className="start-btn"
            onClick={emailAuth}
          >
            {isSignup
              ? "Create Account"
              : "Login"}
          </button>

          <p
            onClick={() =>
              setIsSignup(!isSignup)
            }
          >
            {isSignup
              ? "Already have an account?"
              : "Create account"}
          </p>

          <button
            className="secondary-btn"
            onClick={() =>
              setShowEmailModal(false)
            }
          >
            Close
          </button>

        </div>

      </div>
    )}

  </div>
);

}

export default Login;