using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class VoteController : ControllerBase
{
    private readonly VoteModel _model;

    public VoteController(VoteModel model)
    {
        _model = model;
    }

    // POST: api/vote/login
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            return BadRequest("Missing username or password.");

        // Bypass login for now — accept any username/password
        return Ok("Login successful.");
    }

    // POST: api/vote
    [HttpPost]
    public IActionResult CastVote([FromBody] VoteRequest request)
    {
        if (string.IsNullOrEmpty(request.Mayor) || string.IsNullOrEmpty(request.Issue1))
            return BadRequest("Missing vote selections.");

        _model.CastVote(request.Mayor, request.Issue1);
        return Ok("Vote recorded.");
    }

    // GET: api/vote/results
    [HttpGet("results")]
    public IActionResult GetResults()
    {
        return Ok(new
        {
            mayor = _model.MayorVotes,
            issue1 = _model.Issue1Votes
        });
    }

    // POST: api/vote/reset
    [HttpPost("reset")]
    public IActionResult Reset()
    {
        _model.Reset();
        return Ok("Election reset.");
    }
}

public class VoteRequest
{
    public string Mayor { get; set; } = "";
    public string Issue1 { get; set; } = "";
    public Guid TokenValue { get; set; }
    public int CandidateId { get; set; }
}

public class LoginRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
}