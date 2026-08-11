$ErrorActionPreference = 'Stop'
$ProjectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$Node = (Get-Command node -ErrorAction Stop).Source
& $Node (Join-Path $ProjectDirectory 'scripts\install-existing-n8n.mjs') @args
exit $LASTEXITCODE
