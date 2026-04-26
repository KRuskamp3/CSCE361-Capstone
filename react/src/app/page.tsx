"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [dark, setDark] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!firstName || !lastName || !password) {
            setError("Please fill in all fields.");
            return;
        }
        // remove this when backend is ready
        router.push("/vote");

        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:5000/api/vote/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: firstName + lastName,
                    password: password
                })
            });

            if (res.ok) {
                router.push("/vote");
            } else {
                setError("Invalid username or password.");
            }
        } catch {
            setError("Could not connect to server.");
        } finally {
            setLoading(false);
        }
    }

    const colors = {
        page: dark ? "#1a1a1a" : "#f5f5f3",
        card: dark ? "#2a2a2a" : "white",
        cardBorder: dark ? "#444" : "#e5e5e5",
        text: dark ? "#f0f0f0" : "#111",
        label: dark ? "#bbb" : "#666",
        subtitle: dark ? "#aaa" : "#888",
        input: dark ? "#333" : "white",
        inputBorder: dark ? "#555" : "#ddd",
        inputText: dark ? "#f0f0f0" : "#111",
        btn: dark ? "#f0f0f0" : "#111",
        btnText: dark ? "#111" : "white",
        hr: dark ? "#444" : "#eee",
        footer: dark ? "#777" : "#aaa",
    };

    return (
        <div style={{ fontFamily: "sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: colors.page, transition: "background 0.2s" }}>

            {/* Dark mode toggle */}
            <button onClick={() => setDark(!dark)} style={{ position: "fixed", bottom: "1rem", right: "1rem", background: colors.btn, color: colors.btnText, border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}>
                {dark ? "Light mode" : "Dark mode"}
            </button>

            {/* Card */}
            <div style={{ background: colors.card, border: `1px solid ${colors.cardBorder}`, borderRadius: "12px", padding: "2.5rem 2rem", width: "100%", maxWidth: "380px", transition: "background 0.2s" }}>

                <span style={{ background: "#e6f1fb", color: "#185fa5", fontSize: "11px", padding: "3px 10px", borderRadius: "6px", marginBottom: "1.25rem", display: "inline-block" }}>
                    Pacopolis 2026
                </span>

                <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "0.35rem", color: colors.text }}>
                    Voter login
                </h1>

                <p style={{ fontSize: "14px", color: colors.subtitle, marginBottom: "2rem" }}>
                    Enter your details to access your ballot.
                </p>

                {/* Name row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
                    <div>
                        <label style={{ fontSize: "13px", color: colors.label, display: "block", marginBottom: "5px" }}>First name</label>
                        <input
                            type="text"
                            placeholder="Jane"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            style={{ width: "100%", height: "38px", padding: "0 12px", border: `1px solid ${colors.inputBorder}`, borderRadius: "8px", fontSize: "14px", background: colors.input, color: colors.inputText, outline: "none" }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: "13px", color: colors.label, display: "block", marginBottom: "5px" }}>Last name</label>
                        <input
                            type="text"
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            style={{ width: "100%", height: "38px", padding: "0 12px", border: `1px solid ${colors.inputBorder}`, borderRadius: "8px", fontSize: "14px", background: colors.input, color: colors.inputText, outline: "none" }}
                        />
                    </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: "0.5rem" }}>
                    <label style={{ fontSize: "13px", color: colors.label, display: "block", marginBottom: "5px" }}>Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", height: "38px", padding: "0 12px", border: `1px solid ${colors.inputBorder}`, borderRadius: "8px", fontSize: "14px", fontFamily: "Verdana, sans-serif", background: colors.input, color: colors.inputText, outline: "none" }}
                    />
                </div>

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{ width: "100%", height: "40px", marginTop: "1.5rem", background: colors.btn, color: colors.btnText, border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                    {loading ? "Logging in..." : "Continue to ballot"}
                </button>

                <p style={{ color: "#c0392b", fontSize: "13px", marginTop: "0.75rem", minHeight: "18px" }}>{error}</p>

                <hr style={{ border: "none", borderTop: `1px solid ${colors.hr}`, margin: "1.5rem 0 0" }} />

                <p style={{ fontSize: "12px", color: colors.footer, textAlign: "center", marginTop: "1rem" }}>
                    Your vote is private and secure.
                </p>
            </div>
        </div>
    );
}