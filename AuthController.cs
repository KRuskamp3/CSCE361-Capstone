using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly string _connectionString;

    public AuthController(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        //
        // 1. FIND OR CREATE USER (simple auth model)
        //
        string userSql = @"
            SELECT user_id
            FROM users
            WHERE username = @username";

        int userId;

        using (var cmd = new SqlCommand(userSql, conn))
        {
            cmd.Parameters.AddWithValue("@username", req.FirstName + "." + req.LastName);

            var result = cmd.ExecuteScalar();

            if (result == null)
            {
                string insertUser = @"
                    INSERT INTO users (username, first_name, last_name, password_hash, role)
                    VALUES (@username, @first, @last, @password, 'voter');
                    SELECT SCOPE_IDENTITY();";

                using var insertCmd = new SqlCommand(insertUser, conn);
                insertCmd.Parameters.AddWithValue("@username", req.FirstName + "." + req.LastName);
                insertCmd.Parameters.AddWithValue("@password", req.Password);
                insertCmd.Parameters.AddWithValue("@first", req.FirstName);
                insertCmd.Parameters.AddWithValue("@last", req.LastName);

                userId = Convert.ToInt32(insertCmd.ExecuteScalar());
            }
            else
            {
                userId = Convert.ToInt32(result);
            }
        }

        //
        // 2. FIND OR CREATE VOTER RECORD
        //
        string voterSql = @"
            SELECT voter_id, has_voted
            FROM voters
            WHERE user_id = @userId";

        int voterId;
        bool hasVoted;

        using (var cmd = new SqlCommand(voterSql, conn))
        {
            cmd.Parameters.AddWithValue("@userId", userId);

            using var reader = cmd.ExecuteReader();

            if (!reader.Read())
            {
                reader.Close();

                string insertVoter = @"
                    INSERT INTO voters (first_name, last_name, registered, has_voted, user_id)
                    VALUES (@first, @last, 1, 0, @userId);
                    SELECT SCOPE_IDENTITY();";

                using var insertCmd = new SqlCommand(insertVoter, conn);
                insertCmd.Parameters.AddWithValue("@first", req.FirstName);
                insertCmd.Parameters.AddWithValue("@last", req.LastName);
                insertCmd.Parameters.AddWithValue("@userId", userId);

                voterId = Convert.ToInt32(insertCmd.ExecuteScalar());
                hasVoted = false;
            }
            else
            {
                voterId = reader.GetInt32(0);
                hasVoted = reader.GetBoolean(1);
            }
        }

        //
        // 3. BLOCK IF ALREADY VOTED
        //
        if (hasVoted)
            return BadRequest("You already voted.");

        //
        // 4. GET ACTIVE ELECTION (THIS FIXES YOUR FK BUG)
        //
        string electionSql = @"
            SELECT TOP 1 election_id
            FROM elections
            ORDER BY election_date DESC";

        int electionId;

        using (var cmd = new SqlCommand(electionSql, conn))
        {
            electionId = Convert.ToInt32(cmd.ExecuteScalar());
        }

        //
        // 5. CREATE VOTING TOKEN
        //
        string tokenSql = @"
            INSERT INTO voting_tokens (voter_id, election_id, token_value, used)
            VALUES (@voterId, @electionId, @token, 0)";

        using (var cmd = new SqlCommand(tokenSql, conn))
        {
            cmd.Parameters.AddWithValue("@voterId", voterId);
            cmd.Parameters.AddWithValue("@electionId", electionId); // <-- FIXED (no more FK crash)
            cmd.Parameters.AddWithValue("@token", Guid.NewGuid());

            cmd.ExecuteNonQuery();
        }

        return Ok(new
        {
            message = "Login successful",
            voterId,
            electionId
        });
    }
}

public class LoginRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Password { get; set; } = string.Empty;
}