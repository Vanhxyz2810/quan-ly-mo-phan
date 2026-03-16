FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY src/CemeteryIQ.Core/CemeteryIQ.Core.csproj src/CemeteryIQ.Core/
COPY src/CemeteryIQ.Infrastructure/CemeteryIQ.Infrastructure.csproj src/CemeteryIQ.Infrastructure/
COPY src/CemeteryIQ.Api/CemeteryIQ.Api.csproj src/CemeteryIQ.Api/
RUN dotnet restore src/CemeteryIQ.Api/CemeteryIQ.Api.csproj

# Copy all source and publish
COPY src/ src/
RUN dotnet publish src/CemeteryIQ.Api/CemeteryIQ.Api.csproj -c Release -o /app/publish --no-restore

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5154
EXPOSE 5154

ENTRYPOINT ["dotnet", "CemeteryIQ.Api.dll"]
