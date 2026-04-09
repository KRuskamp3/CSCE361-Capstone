public class Ballot
{
    public int BallotId { get; set; }
    public int ElectionId { get; set; }
    public int CandidateId { get; set; }

    public DateTime CreatedAt { get; set; }
}
