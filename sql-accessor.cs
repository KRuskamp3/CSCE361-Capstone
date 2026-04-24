using System;
using Microsoft.Data.SqlClient;

public class SqlAccessor
{
    private readonly string connectionString;

    public SqlAccessor(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new ArgumentException("Connection string must not be empty.", nameof(connectionString));

        this.connectionString = connectionString;
    }

    /**
     Checks if the username exists. If it does, verify the password.
     Returns true if login is valid, otherwise false.
     */
    public bool AttemptLogin(string username, string password)
    {
        using var conn = new SqlConnection(connectionString);
        conn.Open();

        string query = @"
            SELECT password_hash 
            FROM users 
            WHERE username = @username
        ";

        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@username", username);

        using var reader = cmd.ExecuteReader();

        if (!reader.Read())
            return false;

        string storedHash = reader.GetString(0);

        return BCrypt.Net.BCrypt.Verify(password, storedHash);
    }
}
