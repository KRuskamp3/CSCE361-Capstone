public class VotingToken
{
    public int TokenId { get; set; }

    public int VoterId { get; set; }
    public int ElectionId { get; set; }

    public Guid TokenValue { get; set; }  // Maps to UNIQUEIDENTIFIER
    public bool Used { get; set; } = false;
}