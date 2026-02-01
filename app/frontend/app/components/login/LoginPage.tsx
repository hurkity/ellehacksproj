"use client";
// Add Racing Sans One font import for browser
if (typeof window !== 'undefined') {
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Racing+Sans+One&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);
}


import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (!username || !password) {
      setError("ENTER USERNAME AND PASSWORD");
      return;
    }

    if (username === "hurkity" && password === "hurkpass") {
      setError("");
      router.push("/home");
    } else {
      setError("ACCESS DENIED");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={styles.page}>
      {/* Left image */}
      <div style={styles.leftImageContainer}>
        <img src="/login.png" alt="Login" style={styles.leftImage} />
      </div>

      {/* Skewed background */}
      <div style={styles.skewedBg} />

      {/* Login Panel */}
      <div style={styles.panel}>
        <img src="/logo.png" alt="Meowbility Logo" style={{ width: 400, height: 'auto', marginBottom: 30, marginTop: -10, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />

        <input
          type="text"
          placeholder="USERNAME"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleLogin} style={styles.button}>
          ▶ START
        </button>

        <div style={styles.footer}>
          <span style={styles.link}>Forgot Password?</span>
          <span style={styles.link}>Sign Up</span>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  leftImageContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "48vw",
    height: "100vh",
    zIndex: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  leftImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center left",
    display: "block",
    pointerEvents: "none",
    userSelect: "none",
  },
  page: {
    position: "fixed",
    inset: 0,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    fontFamily: "'Racing Sans One', Arial, sans-serif",
    color: '#ff69b4',
  },

  skewedBg: {
    position: "absolute",
    top: 0,
    bottom: 0,        // ⬅ full height
    left: "55%",
    width: "40%",
    backgroundColor: "#ff9f43",
    transform: "skewX(-12deg)",
    transformOrigin: "top left",
    zIndex: 0,
  },


  panel: {
    position: "relative",
    zIndex: 1,
    left: "20%",
    backgroundColor: "rgba(251, 200, 133, 0.75)",
    padding: "50px",
    borderRadius: "12px",
    width: "360px",
    boxShadow: "0 0 30px rgba(81, 42, 16, 0.6)",
    textAlign: "center",
  },

  title: {
    color: "#df3696",
    fontFamily: "'Racing Sans One', Arial, sans-serif",
    fontSize: "48px",
    letterSpacing: "4px",
    marginBottom: "30px",
    fontWeight: 900,
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "18px",
    fontSize: "16px",
    backgroundColor: "#a3d6ff",
    border: "2px solid #75b5ff",
    borderRadius: "6px",
    color: "#df3696",
    outline: "none",
    fontFamily: "'Racing Sans One', Arial, sans-serif",
    fontWeight: 200,
  },

  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#ff9f43",
    border: "none",
    borderRadius: "6px",
    fontSize: "20px",
    fontWeight: 900,
    cursor: "pointer",
    color: "#df3696",
    marginTop: "10px",
    fontFamily: "'Racing Sans One', Arial, sans-serif",
    letterSpacing: 2,
  },

  error: {
    color: "#ff4d4d",
    fontSize: "14px",
    marginBottom: "10px",
    fontFamily: "'Racing Sans One', Arial, sans-serif",
  },

  footer: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    color: "#ff69b4",
    fontFamily: "'Racing Sans One', Arial, sans-serif",
  },

  link: {
    cursor: "pointer",
    textDecoration: "underline",
    color: "#ff69b4",
    fontFamily: "'Racing Sans One', Arial, sans-serif",
  },
};

export default Login;
