public class VoteModel
{
	public Dictionary<string, int> MayorVotes { get; } = new()
	{
		{ "Pat Mann", 0 },
		{ "Dawn Keykong", 0 }
	};

	public Dictionary<string, int> Issue1Votes { get; } = new()
	{
		{ "Yes", 0 },
		{ "No", 0 }
	};

	public void CastVote(string mayor, string issue1)
	{
		if (MayorVotes.ContainsKey(mayor))
			MayorVotes[mayor]++;

		if (Issue1Votes.ContainsKey(issue1))
			Issue1Votes[issue1]++;
	}

	public void Reset()
	{
		foreach (var key in MayorVotes.Keys) MayorVotes[key] = 0;
		foreach (var key in Issue1Votes.Keys) Issue1Votes[key] = 0;
	}
}