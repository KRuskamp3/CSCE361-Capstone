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

    // Create election
    public int CreateElection(Election election)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        string query = @"
            INSERT INTO elections (name, election_date, type)
            VALUES (@name, @date, @type);
            SELECT CAST(SCOPE_IDENTITY() as int);
        ";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@name", election.Name);
        cmd.Parameters.AddWithValue("@date", election.ElectionDate);
        cmd.Parameters.AddWithValue("@type", election.Type);

        return (int)cmd.ExecuteScalar();
    }

    // Create candidate
    public int CreateCandidate(Candidate candidate)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        string query = @"
            INSERT INTO candidates (election_id, name, party)
            VALUES (@electionId, @name, @party);
            SELECT CAST(SCOPE_IDENTITY() as int);
        ";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@electionId", candidate.ElectionId);
        cmd.Parameters.AddWithValue("@name", candidate.Name);
        cmd.Parameters.AddWithValue("@party", candidate.Party);

        return (int)cmd.ExecuteScalar();
    }

    // Register user with authentication
    public int RegisterUser(User user)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        string query = @"
            INSERT INTO users (username, password_hash, role)
            VALUES (@username, @passwordHash, @role);
            SELECT CAST(SCOPE_IDENTITY() as int);
        ";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@username", user.Username);
        cmd.Parameters.AddWithValue("@passwordHash", user.PasswordHash);
        cmd.Parameters.AddWithValue("@role", user.Role);

        return (int)cmd.ExecuteScalar();
    }

    // Register voter
    public int RegisterVoter(Voter voter)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        string query = @"
            INSERT INTO voters (first_name, last_name, date_of_birth, address, registered, has_voted, user_id)
            VALUES (@first, @last, @dob, @address, @registered, @hasVoted, @userId);
            SELECT CAST(SCOPE_IDENTITY() as int);
        ";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@first", voter.FirstName);
        cmd.Parameters.AddWithValue("@last", voter.LastName);
        cmd.Parameters.AddWithValue("@dob", voter.DateOfBirth);
        cmd.Parameters.AddWithValue("@address", voter.Address);
        cmd.Parameters.AddWithValue("@registered", voter.Registered);
        cmd.Parameters.AddWithValue("@hasVoted", voter.HasVoted);
        cmd.Parameters.AddWithValue("@userId", voter.UserId);

        return (int)cmd.ExecuteScalar();
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

        try
        {
            cmd.ExecuteNonQuery();
            return token;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating token: {ex.Message}");
            throw;
        }
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

            using (var cmd = new SqlCommand(query, conn, transaction))
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

            using (var ballotCmd = new SqlCommand(insertBallot, conn, transaction))
            {
                ballotCmd.Parameters.AddWithValue("@electionId", electionId);
                ballotCmd.Parameters.AddWithValue("@candidateId", candidateId);
                ballotCmd.ExecuteNonQuery();
            }

            // Mark token used
            string updateToken = @"
                UPDATE voting_tokens
                SET used = 1
                WHERE token_value = @token;
            ";

            using (var updateCmd = new SqlCommand(updateToken, conn, transaction))
            {
                updateCmd.Parameters.AddWithValue("@token", tokenValue);
                updateCmd.ExecuteNonQuery();
            }

            // Mark voter as HasVoted
            string updateVoter = @"
                UPDATE voters
                SET has_voted = 1
                WHERE voter_id = (
                    SELECT vt.voter_id
                    FROM voting_tokens vt
                    WHERE vt.token_value = @token
                );
            ";

            using (var voterCmd = new SqlCommand(updateVoter, conn, transaction))
            {
                voterCmd.Parameters.AddWithValue("@token", tokenValue);
                voterCmd.ExecuteNonQuery();
            }

            transaction.Commit();
            return true;
        }
        catch (Exception ex)
        {
            transaction.Rollback();
            Console.WriteLine($"Error casting vote: {ex.Message}");
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
