"use client";
import { useState } from "react";


export default function Login() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [dark, setDark] = useState(false);

    async function handleLogin() {
        setError("");

        if (!firstName || !lastName || !password) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    password
                })
            });

        if (res.ok) {
            sessionStorage.setItem("firstName", firstName);
            sessionStorage.setItem("lastName", lastName);

            window.location.href = "/vote"; // React route (or keep vote.html if not using router)
        }
        


  
            //window.location.href = "/vote"; // React route (or keep vote.html if not using router)
        } catch {
            setError("Server not reachable.");
        }
    }

    const styles = {
        page: {
            fontFamily: "sans-serif",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: dark ? "#1a1a1a" : "#f5f5f3",
        },
        card: {
            background: dark ? "#2a2a2a" : "white",
            border: `1px solid ${dark ? "#444" : "#e5e5e5"}`,
            borderRadius: "12px",
            padding: "2.5rem 2rem",
            width: "100%",
            maxWidth: "380px",
        },
        input: {
            width: "100%",
            padding: "0 12px",
            height: "38px",
            border: `1px solid ${dark ? "#555" : "#ddd"}`,
            borderRadius: "8px",
            fontSize: "14px",
            background: dark ? "#333" : "white",
            color: dark ? "#f0f0f0" : "#111",
            marginBottom: "1rem",
        },
        button: {
            width: "100%",
            height: "40px",
            marginTop: "1.5rem",
            background: dark ? "#f0f0f0" : "#111",
            color: dark ? "#111" : "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
        }
    };

    return (
        <div style={styles.page}>
            <button
                onClick={() => setDark(!dark)}
                style={{
                    position: "fixed",
                    bottom: "1rem",
                    right: "1rem",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "1px solid #aaa",
                    cursor: "pointer"
                }}
            >
                {dark ? "Light mode" : "Dark mode"}
            </button>

            <div style={styles.card}>
                <span style={{
                    background: "#e6f1fb",
                    color: "#185fa5",
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "6px"
                }}>
                    Pacopolis 2026
                </span>

                <h1 style={{ marginTop: "10px", color: dark ? "#f0f0f0" : "#111" }}>
                    Voter login
                </h1>

                <p style={{ color: dark ? "#aaa" : "#888" }}>
                    Enter your details to access your ballot.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <input
                        placeholder="First"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        placeholder="Last"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        style={styles.input}
                    />
                </div>

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={styles.input}
                />

                <button onClick={handleLogin} style={styles.button}>
                    Continue to ballot
                </button>

                {error && (
                    <p style={{ color: "red", fontSize: "13px", marginTop: "10px" }}>
                        {error}
                    </p>
                )}

                <hr style={{ marginTop: "20px", border: "1px solid #eee" }} />

                <p style={{ fontSize: "12px", color: "#aaa", textAlign: "center" }}>
                    Your vote is private and secure.
                </p>
            </div>
        </div>
    );
}