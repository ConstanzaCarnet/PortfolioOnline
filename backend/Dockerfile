# ── Build stage ────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore first (cached layer) using only the project file.
COPY PortfolioApi.csproj ./
RUN dotnet restore PortfolioApi.csproj

# Copy the rest and publish a trimmed release build.
COPY . ./
RUN dotnet publish PortfolioApi.csproj -c Release -o /app --no-restore

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

# Render injects PORT at runtime; Program.cs validates it and binds 0.0.0.0:$PORT.
# EXPOSE is documentation only — the actual bind comes from the PORT env var.
EXPOSE 8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "PortfolioApi.dll"]
