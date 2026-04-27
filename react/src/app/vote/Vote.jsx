"use client";
import { useEffect, useState } from "react";

export default function Vote() {
    const electionId = 12;

    const [candidates, setCandidates] = useState([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [status, setStatus] = useState("");
    const [statusType, setStatusType] = useState(""); // "error" | "success"

    // Load candidates on mount
    useEffect(() => {
        loadCandidates();
    }, []);

    async function loadCandidates() {
        setStatus("Loading candidates...");
        setStatusType("");

        try {
            const res = await fetch(
                `http://localhost:5000/api/vote/candidates?electionId=${electionId}`
            );

            if (!res.ok) {
                setStatus("Failed to load candidates.");
                setStatusType("error");
                return;
            }

            const data = await res.json();
            setCandidates(data);
            setStatus("");
        } catch {
            setStatus("Server unreachable.");
            setStatusType("error");
        }
    }

    async function submitVote() {
        if (!selectedCandidateId) {
            setStatus("Please select a candidate.");
            setStatusType("error");
            return;
        }

        const payload = {
            electionId,
            candidateId: selectedCandidateId,
            firstName: sessionStorage.getItem("firstName"),
            lastName: sessionStorage.getItem("lastName"),
        };

        try {
            const res = await fetch("http://localhost:5000/api/vote/cast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const text = await res.text();

            if (!res.ok) {
                setStatus(text || "Vote submission failed.");
                setStatusType("error");
                return;
            }

            setStatus("Vote submitted successfully.");
            setStatusType("success");
        } catch {
            setStatus("Network error submitting vote.");
            setStatusType("error");
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2>Pacopolis Mayor Election (2026)</h2>

                {candidates.map((c) => (
                    <div
                        key={c.candidateId}
                        onClick={() => setSelectedCandidateId(c.candidateId)}
                        style={{
                            ...styles.candidate,
                            ...(selectedCandidateId === c.candidateId
                                ? styles.selected
                                : {}),
                        }}
                    >
                        <input
                            type="radio"
                            checked={selectedCandidateId === c.candidateId}
                            onChange={() => setSelectedCandidateId(c.candidateId)}
                        />
                        {c.name} ({c.party})
                    </div>
                ))}

                <button onClick={submitVote} style={styles.button}>
                    Submit Vote
                </button>

                {status && (
                    <p
                        style={{
                            marginTop: "15px",
                            color: statusType === "error" ? "red" : "green",
                        }}
                    >
                        {status}
                    </p>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        fontFamily: "sans-serif",
        background: "#f5f5f3",
        minHeight: "100vh",
        paddingTop: "60px",
    },
    container: {
        maxWidth: "600px",
        margin: "0 auto",
        background: "#fff",
        padding: "24px",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
    candidate: {
        padding: "12px",
        border: "1px solid #ddd",
        margin: "10px 0",
        borderRadius: "6px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    selected: {
        background: "#e9e9e9",
        borderColor: "#111",
    },
    button: {
        width: "100%",
        padding: "14px",
        marginTop: "20px",
        fontSize: "16px",
        cursor: "pointer",
        border: "none",
        borderRadius: "6px",
        background: "#333",
        color: "white",
    },
};