"use client";

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
      {/* Skewed background */}
      <div style={styles.skewedBg} />

      {/* Login Panel */}
      <div style={styles.panel}>
        <h1 style={styles.title}>LOGIN</h1>

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
  page: {
    position: "fixed",
    inset: 0,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    fontFamily: "'Orbitron', Arial, sans-serif",
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
    color: "#1d376a",
    fontSize: "42px",
    letterSpacing: "4px",
    marginBottom: "30px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "18px",
    fontSize: "16px",
    backgroundColor: "#a3d6ff",
    border: "2px solid #75b5ff",
    borderRadius: "6px",
    color: "#1d376a",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#ff9f43",
    border: "none",
    borderRadius: "6px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#1d376a",
    marginTop: "10px",
  },

  error: {
    color: "#ff4d4d",
    fontSize: "14px",
    marginBottom: "10px",
  },

  footer: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#1d376a",
  },

  link: {
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default Login;
