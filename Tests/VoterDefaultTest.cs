using System;
using Xunit;

public class VoterDefaultTest
{
    [Fact]
    public void NewVoter_HasExpectedDefaults()
    {
        var voter = new Voter();

        Assert.True(voter.Registered);
        Assert.False(voter.HasVoted);
    }
}
