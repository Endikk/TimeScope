# Use the official .NET SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy the solution file and project files first to leverage caching
COPY ["TimeScope.sln", "./"]
COPY ["TimeScope.API/TimeScope.API.csproj", "TimeScope.API/"]
COPY ["TimeScope.Core/TimeScope.Core.csproj", "TimeScope.Core/"]
COPY ["TimeScope.Infrastructure/TimeScope.Infrastructure.csproj", "TimeScope.Infrastructure/"]

# Restore dependencies
RUN dotnet restore

# Copy the rest of the source code
COPY . .

# Build and publish the API project
WORKDIR "/src/TimeScope.API"
RUN dotnet publish -c Release -o /app/publish

# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TimeScope.API.dll"]
