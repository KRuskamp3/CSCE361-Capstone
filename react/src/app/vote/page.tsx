"use client";
import { useState } from "react";

type Results = {
    mayor: Record<string, number>;
    issue1: Record<string, number>;
};

export default function Vote() {
    const [mayorVote, setMayorVote] = useState<string | null>(null);
    const [issueVote, setIssueVote] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [status, setStatus] = useState({ msg: "", type: "" });
    const [results, setResults] = useState<Results | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [dark, setDark] = useState(false);

    const API = "http://localhost:5000/api/vote";

    const c = {
        page: dark ? "#1a1a1a" : "#f5f5f3",
        card: dark ? "#2a2a2a" : "white",
        cardBorder: dark ? "#444" : "#e5e5e5",
        heading: dark ? "#f0f0f0" : "#111",
        subheading: dark ? "#f0f0f0" : "#111",
        divider: dark ? "#444" : "#eee",
        label: dark ? "#f0f0f0" : "#111",
        muted: dark ? "#aaa" : "#888",
        optionBorder: dark ? "#444" : "#eee",
        optionSelected: dark ? "#1a2a3a" : "#e6f1fb",
        optionSelectedBorder: "#378add",
        optionBg: dark ? "#2a2a2a" : "white",
        barBg: dark ? "#444" : "#f0f0f0",
        resultLabel: dark ? "#bbb" : "#555",
        resultCount: dark ? "#f0f0f0" : "#111",
        btn: dark ? "#f0f0f0" : "#111",
        btnText: dark ? "#111" : "white",
    };

    function selectMayor(candidate: string) {
        if (hasVoted) {
            setStatus({ msg: "You have already voted. Duplicate voting is not allowed.", type: "error" });
            return;
        }

        setMayorVote(candidate);
        setStatus({ msg: "", type: "" });
    }

    function selectIssue(option: string) {
        if (hasVoted) {
            setStatus({ msg: "You have already voted. Duplicate voting is not allowed.", type: "error" });
            return;
        }

        setIssueVote(option);
        setStatus({ msg: "", type: "" });
    }

    async function confirmVote() {
        if (hasVoted) {
            setStatus({ msg: "You have already voted. Duplicate voting is not allowed.", type: "error" });
            return;
        }

        if (!mayorVote || !issueVote) {
            setStatus({ msg: "Please complete the ballot before confirming.", type: "error" });
            return;
        }

        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mayor: mayorVote, issue1: issueVote }),
            });

            if (res.ok) {
                setHasVoted(true);
                setStatus({
                    msg: `Vote submitted! Mayor: ${mayorVote} | Issue 1: ${issueVote}`,
                    type: "success",
                });
            } else {
                setStatus({ msg: "Something went wrong.", type: "error" });
            }
        } catch {
            setStatus({ msg: "Could not connect to server.", type: "error" });
        }
    }

    async function showResultsClick() {
        try {
            const res = await fetch(`${API}/results`);
            const data = await res.json();

            setResults(data);
            setShowResults(true);
        } catch {
            setStatus({ msg: "Could not load results.", type: "error" });
        }
    }

    async function resetElection() {
        try {
            await fetch(`${API}/reset`, { method: "POST" });

            setResults(null);
            setMayorVote(null);
            setIssueVote(null);
            setHasVoted(false);
            setShowResults(false);
            setStatus({ msg: "Election reset. Please complete the ballot.", type: "success" });
        } catch {
            setStatus({ msg: "Could not reset.", type: "error" });
        }
    }

    function getWinner(category: Record<string, number>) {
        let max = -1;
        let winners: string[] = [];

        for (let option in category) {
            const voteCount = category[option];

            if (voteCount > max) {
                max = voteCount;
                winners = [option];
            } else if (voteCount === max) {
                winners.push(option);
            }
        }

        if (max === 0) {
            return "No votes yet";
        }

        if (winners.length === 1) {
            return winners[0];
        }

        return "Tie between " + winners.join(" and ");
    }

    const mayorTotal = results ? Object.values(results.mayor).reduce((a, b) => a + b, 0) : 0;
    const issueTotal = results ? Object.values(results.issue1).reduce((a, b) => a + b, 0) : 0;

    const mayorWinner = results ? getWinner(results.mayor) : "";
    const issueWinner = results ? getWinner(results.issue1) : "";

    return (
        <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: c.page, padding: "2rem", transition: "background 0.2s" }}>
            <button
                onClick={() => setDark(!dark)}
                style={{ position: "fixed", bottom: "1rem", right: "1rem", background: c.btn, color: c.btnText, border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}
            >
                {dark ? "Light mode" : "Dark mode"}
            </button>

            <div style={{ maxWidth: "640px", margin: "0 auto 2rem" }}>
                <span style={{ background: "#e6f1fb", color: "#185fa5", fontSize: "11px", padding: "3px 10px", borderRadius: "6px" }}>
                    Pacopolis 2026
                </span>
                <h1 style={{ fontSize: "22px", fontWeight: 500, color: c.heading, marginTop: "0.25rem" }}>
                    Your ballot
                </h1>
            </div>

            {status.msg && (
                <div style={{ maxWidth: "640px", margin: "0 auto 1rem", padding: "0.6rem 1rem", borderRadius: "8px", fontSize: "13px", background: status.type === "success" ? (dark ? "#1a3a1a" : "#eafde6") : (dark ? "#3a1a1a" : "#fff0f0"), color: status.type === "success" ? (dark ? "#7ac87a" : "#2d7a1f") : (dark ? "#e07070" : "#c0392b") }}>
                    {status.msg}
                </div>
            )}

            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: "12px", padding: "1.75rem", maxWidth: "640px", margin: "0 auto 1.25rem" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: `1px solid ${c.divider}`, color: c.subheading }}>
                    Mayor race
                </h2>

                {["Pat Mann", "Dawn Keykong"].map((candidate) => (
                    <div
                        key={candidate}
                        onClick={() => selectMayor(candidate)}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.75rem 1rem", border: `1px solid ${mayorVote === candidate ? c.optionSelectedBorder : c.optionBorder}`, borderRadius: "8px", marginBottom: "0.5rem", cursor: hasVoted ? "not-allowed" : "pointer", background: mayorVote === candidate ? c.optionSelected : c.optionBg }}
                    >
                        <input
                            type="radio"
                            checked={mayorVote === candidate}
                            disabled={hasVoted}
                            onChange={() => selectMayor(candidate)}
                            style={{ accentColor: "#378add" }}
                        />
                        <label style={{ fontSize: "14px", color: c.label, cursor: hasVoted ? "not-allowed" : "pointer" }}>
                            {candidate}
                        </label>
                    </div>
                ))}
            </div>

            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: "12px", padding: "1.75rem", maxWidth: "640px", margin: "0 auto 1.25rem" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: `1px solid ${c.divider}`, color: c.subheading }}>
                    Issue 1: Build a new park?
                </h2>

                {["Yes", "No"].map((option) => (
                    <div
                        key={option}
                        onClick={() => selectIssue(option)}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.75rem 1rem", border: `1px solid ${issueVote === option ? c.optionSelectedBorder : c.optionBorder}`, borderRadius: "8px", marginBottom: "0.5rem", cursor: hasVoted ? "not-allowed" : "pointer", background: issueVote === option ? c.optionSelected : c.optionBg }}
                    >
                        <input
                            type="radio"
                            checked={issueVote === option}
                            disabled={hasVoted}
                            onChange={() => selectIssue(option)}
                            style={{ accentColor: "#378add" }}
                        />
                        <label style={{ fontSize: "14px", color: c.label, cursor: hasVoted ? "not-allowed" : "pointer" }}>
                            {option}
                        </label>
                    </div>
                ))}
            </div>

            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: "12px", padding: "1.25rem", maxWidth: "640px", margin: "0 auto 1.25rem" }}>
                <h2 style={{ fontSize: "15px", fontWeight: 500, color: c.subheading, marginBottom: "0.5rem" }}>
                    Review your selection
                </h2>

                {!mayorVote || !issueVote ? (
                    <p style={{ fontSize: "13px", color: c.muted }}>
                        Please complete the ballot.
                    </p>
                ) : (
                    <p style={{ fontSize: "13px", color: c.resultCount }}>
                        Mayor: {mayorVote} | Issue 1: {issueVote}
                    </p>
                )}
            </div>

            <div style={{ maxWidth: "640px", margin: "0 auto 1.25rem", display: "flex", gap: "10px" }}>
                <button onClick={confirmVote} style={{ flex: 1, height: "42px", background: c.btn, color: c.btnText, border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
                    Confirm vote
                </button>

                <button onClick={showResultsClick} style={{ flex: 1, height: "42px", background: c.btn, color: c.btnText, border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
                    Show results
                </button>

                <button onClick={resetElection} style={{ flex: 1, height: "42px", background: c.btn, color: c.btnText, border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
                    Reset
                </button>
            </div>

            {showResults && results && (
                <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: "12px", padding: "1.75rem", maxWidth: "640px", margin: "0 auto" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 500, marginBottom: "1rem", color: c.subheading }}>
                        Current results
                    </h2>

                    <p style={{ fontSize: "13px", color: c.muted, marginBottom: "1rem" }}>
                        Mayor race
                    </p>

                    {Object.entries(results.mayor).map(([name, votes]) => (
                        <div key={name} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "13px", color: c.resultLabel, width: "130px" }}>{name}</span>
                            <div style={{ flex: 1, background: c.barBg, borderRadius: "4px", height: "8px" }}>
                                <div style={{ width: mayorTotal ? `${(votes / mayorTotal) * 100}%` : "0%", height: "8px", borderRadius: "4px", background: "#378add", transition: "width 0.4s" }} />
                            </div>
                            <span style={{ fontSize: "13px", color: c.resultCount, minWidth: "30px", textAlign: "right" }}>{votes}</span>
                        </div>
                    ))}

                    <p style={{ fontSize: "13px", color: c.resultCount, marginTop: "0.75rem" }}>
                        Winner: {mayorWinner}
                    </p>

                    <p style={{ fontSize: "13px", color: c.muted, margin: "1rem 0" }}>
                        Issue 1
                    </p>

                    {Object.entries(results.issue1).map(([option, votes]) => (
                        <div key={option} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "13px", color: c.resultLabel, width: "130px" }}>{option}</span>
                            <div style={{ flex: 1, background: c.barBg, borderRadius: "4px", height: "8px" }}>
                                <div style={{ width: issueTotal ? `${(votes / issueTotal) * 100}%` : "0%", height: "8px", borderRadius: "4px", background: "#378add", transition: "width 0.4s" }} />
                            </div>
                            <span style={{ fontSize: "13px", color: c.resultCount, minWidth: "30px", textAlign: "right" }}>{votes}</span>
                        </div>
                    ))}

                    <p style={{ fontSize: "13px", color: c.resultCount, marginTop: "0.75rem" }}>
                        Winning option: {issueWinner}
                    </p>
                </div>
            )}
        </div>
    );
}
