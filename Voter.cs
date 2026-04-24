public class Voter
{
    public int VoterId { get; set; }  // Maps to INT IDENTITY
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; }

    public bool Registered { get; set; } = true;
    public bool HasVoted { get; set; } = false;
    public int UserId { get; set; }
}
