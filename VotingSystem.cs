using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;

public class VotingService
{
    private readonly string _connectionString;

    public VotingService(string connectionString)
    {
        _connectionString = connectionString;
    }

    // Register voter
    public void RegisterVoter(Voter voter)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        string query = @"
            INSERT INTO voters (first_name, last_name, date_of_birth, address)
            VALUES (@first, @last, @dob, @address);
        ";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@first", voter.FirstName);
        cmd.Parameters.AddWithValue("@last", voter.LastName);
        cmd.Parameters.AddWithValue("@dob", voter.DateOfBirth);
        cmd.Parameters.AddWithValue("@address", voter.Address);

        cmd.ExecuteNonQuery();
    }

    // Generate token
    public VotingToken GenerateToken(int voterId, int electionId)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        var token = new VotingToken
        {
            VoterId = voterId,
            ElectionId = electionId,
            TokenValue = Guid.NewGuid(),
            Used = false
        };

        string query = @"
            INSERT INTO voting_tokens (voter_id, election_id, token_value, used)
            VALUES (@voterId, @electionId, @token, @used);
        ";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@voterId", token.VoterId);
        cmd.Parameters.AddWithValue("@electionId", token.ElectionId);
        cmd.Parameters.AddWithValue("@token", token.TokenValue);
        cmd.Parameters.AddWithValue("@used", token.Used);

        cmd.ExecuteNonQuery();

        return token;
    }

    // Cast vote
    public bool CastVote(Guid tokenValue, int candidateId)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        using var transaction = conn.BeginTransaction();

        try
        {
            // Get token
            string query = @"
                SELECT election_id, used
                FROM voting_tokens
                WHERE token_value = @token;
            ";

            int electionId;
            bool used;

            using (var cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@token", tokenValue);

                using var reader = cmd.ExecuteReader();

                if (!reader.Read())
                    return false;

                electionId = reader.GetInt32(0);
                used = reader.GetBoolean(1);
            }

            if (used)
                return false;

            // Insert ballot
            string insertBallot = @"
                INSERT INTO ballots (election_id, candidate_id)
                VALUES (@electionId, @candidateId);
            ";

            using (var ballotCmd = new SqlCommand(insertBallot, conn))
            {
                ballotCmd.Parameters.AddWithValue("@electionId", electionId);
                ballotCmd.Parameters.AddWithValue("@candidateId", candidateId);
                ballotCmd.ExecuteNonQuery();
            }

            // Mark token used
            string updateToken = @"
                UPDATE voting_tokens
                SET used = TRUE
                WHERE token_value = @token;
            ";

            using (var updateCmd = new SqlCommand(updateToken, conn))
            {
                updateCmd.Parameters.AddWithValue("@token", tokenValue);
                updateCmd.ExecuteNonQuery();
            }

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            return false;
        }
    }

    // Get results
    public Dictionary<string, int> GetResults(int electionId)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        string query = @"
            SELECT c.name, COUNT(*) 
            FROM ballots b
            JOIN candidates c ON b.candidate_id = c.candidate_id
            WHERE b.election_id = @electionId
            GROUP BY c.name;
        ";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@electionId", electionId);

        var results = new Dictionary<string, int>();

        using var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            string name = reader.GetString(0);
            int votes = reader.GetInt32(1);

            results[name] = votes;
        }

        return results;
    }
}