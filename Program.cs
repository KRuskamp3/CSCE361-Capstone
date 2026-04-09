using Microsoft.Extensions.Configuration;

class Program
{
    static void Main()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
        
        var config = builder.Build();
        var connectionString = config.GetConnectionString("DefaultConnection");
        
        var service = new VotingService(connectionString);

        var voter = new Voter
        {
            FirstName = "Jane",
            LastName = "Doe",
            DateOfBirth = new DateTime(1995, 5, 1),
            Address = "456 Elm St"
        };

        service.RegisterVoter(voter);

        var token = service.GenerateToken(1, 1);

        bool success = service.CastVote(token.TokenValue, 2);

        var results = service.GetResults(1);

        foreach (var r in results)
        {
            Console.WriteLine($"{r.Key}: {r.Value}");
        }
    }
}