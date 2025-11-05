using Microsoft.EntityFrameworkCore;
using Serilog;
using TimeScope.Core.Interfaces;
using TimeScope.Infrastructure.Data;
using TimeScope.Infrastructure.Repositories;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/timescope-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configure JSON serialization to use camelCase for property names
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Multiple Databases
// Admin Database - Users, Roles, Settings
builder.Services.AddDbContext<AdminDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("AdminConnection")));

// Projects Database - Projects, Groups, Themes
builder.Services.AddDbContext<ProjectsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("ProjectsConnection")));

// Time Database - Tasks, Time Entries
builder.Services.AddDbContext<TimeDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("TimeConnection")));

// Reports Database - Analytics, Logs, Audit
builder.Services.AddDbContext<ReportsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("ReportsConnection")));

// Register Specialized Unit of Work for each database
builder.Services.AddScoped<IAdminUnitOfWork, AdminUnitOfWork>();
builder.Services.AddScoped<IProjectsUnitOfWork, ProjectsUnitOfWork>();
builder.Services.AddScoped<ITimeUnitOfWork, TimeUnitOfWork>();

// Note: Legacy IUnitOfWork is deprecated - use specialized UnitOfWork instead

// Configure AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Configure FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Configure MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

// Configure CORS for Next.js frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder => builder
            .WithOrigins("http://localhost:3000") // Next.js dev server
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseSerilogRequestLogging();
app.UseAuthorization();
app.MapControllers();

try
{
    Log.Information("Starting TimeScope API...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
