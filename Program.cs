var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("_MyAllowSubdomainPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddSingleton<VoteModel>();

var app = builder.Build();

app.UseCors("_MyAllowSubdomainPolicy");
app.UseAuthorization();
app.MapControllers();
app.Run();
