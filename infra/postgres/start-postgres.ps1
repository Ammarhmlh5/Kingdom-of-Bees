# start-postgres.ps1
# Attempts to start Postgres via docker-compose if Docker is installed.
param()
Write-Output "Checking for docker..."
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
  Write-Output "Running docker-compose up -d in $PSScriptRoot"
  Push-Location $PSScriptRoot
  docker-compose up -d
  Pop-Location
  exit 0
}
Write-Output "Docker not found. Next options:"
Write-Output "- Install Docker Desktop and rerun this script."
Write-Output "- If you have Postgres installed, ensure a cluster is running and set DATABASE_URL in packages/db/packages/platform/.env"
Write-Output "- Use Vagrant VM at infra/vagrant_vm to run Docker (vagrant not included)."
