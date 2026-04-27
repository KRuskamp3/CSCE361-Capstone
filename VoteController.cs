using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

[ApiController]
[Route("api/vote")]
public class VoteController : ControllerBase
{
    private readonly string _connectionString;

    public VoteController(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection");
    }

    [HttpPost("cast")]
    public IActionResult CastVote(VoteRequest req)
    {
        using var conn = new SqlConnection(_connectionString);
        conn.Open();

        using var transaction = conn.BeginTransaction();

        try
        {
            // 1. Check if voter already voted
            string checkSql = @"
    SELECT voter_id, has_voted
    FROM voters
    WHERE first_name = @first AND last_name = @last";

using var checkCmd = new SqlCommand(checkSql, conn, transaction);
checkCmd.Parameters.AddWithValue("@first", req.FirstName);
checkCmd.Parameters.AddWithValue("@last", req.LastName);

using var reader = checkCmd.ExecuteReader();

if (!reader.Read())
    return BadRequest("Voter not found.");

int voterId = reader.GetInt32(0);
bool hasVoted = reader.GetBoolean(1);
reader.Close();


            if (hasVoted)
                return BadRequest("You already voted.");

            // 2. Insert ballot
            string insertSql = @"
                INSERT INTO ballots (election_id, candidate_id, created_at)
                VALUES (@electionId, @candidateId, GETDATE())";

            using var insertCmd = new SqlCommand(insertSql, conn, transaction);
            insertCmd.Parameters.AddWithValue("@electionId", req.ElectionId);
            insertCmd.Parameters.AddWithValue("@candidateId", req.CandidateId);
            insertCmd.ExecuteNonQuery();

            // 3. Mark voter as voted
            string updateSql = @"
                UPDATE voters
                SET has_voted = 1
                WHERE voter_id = @id";

            using var updateCmd = new SqlCommand(updateSql, conn, transaction);
            updateCmd.Parameters.AddWithValue("@id", voterId);
            updateCmd.ExecuteNonQuery();

            transaction.Commit();
            return Ok("Vote recorded");
        }
        catch (Exception ex)
{
    Console.WriteLine(ex.ToString());
    return StatusCode(500, ex.Message);
}
    }
[HttpGet("candidates")]
public IActionResult GetCandidates([FromQuery] int electionId)
{
    using var conn = new SqlConnection(_connectionString);
    conn.Open();

    string sql = @"
        SELECT candidate_id, name, party
        FROM candidates
        WHERE election_id = @electionId";

    using var cmd = new SqlCommand(sql, conn);
    cmd.Parameters.AddWithValue("@electionId", electionId);

    using var reader = cmd.ExecuteReader();

    var list = new List<object>();

    while (reader.Read())
    {
        list.Add(new {
            candidateId = reader.GetInt32(0),
            name = reader.GetString(1),
            party = reader.GetString(2)
        });
    }

    return Ok(list);
}
}

public class VoteRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public int CandidateId { get; set; }
    public int ElectionId { get; set; }
}
