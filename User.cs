using System;

public class User
{
    public int UserId { get; set; }  // INT IDENTITY in SQL

    public string Username { get; set; } = string.Empty;

    // Store a HASH, not the plain password
    public string PasswordHash { get; set; } = string.Empty;

    // Optional: role-based access (voter, admin, etc.)
    public string Role { get; set; } = "voter";


}
