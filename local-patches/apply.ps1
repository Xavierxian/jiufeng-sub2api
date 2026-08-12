param(
  [switch]$CheckOnly,
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$RemainingArgs
)

$ErrorActionPreference = "Stop"

if ($RemainingArgs -contains "--check") {
  $CheckOnly = $true
}

$PatchName = "001-user-group-allowlist.patch"
$PatchPath = Join-Path $PSScriptRoot $PatchName
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

function Invoke-GitApply {
  param(
    [string[]]$Arguments
  )

  & git @Arguments
  return $LASTEXITCODE
}

function Test-GitApply {
  param(
    [string[]]$Arguments
  )

  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & git @Arguments 1>$null 2>$null
    return $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

function Read-TextFile {
  param(
    [string]$Path
  )

  return [System.IO.File]::ReadAllText((Resolve-Path $Path))
}

function Write-TextFile {
  param(
    [string]$Path,
    [string]$Content
  )

  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Resolve-Path $Path), $Content, $encoding)
}

function Test-UserGroupAllowlistFallbackApplied {
  $backendPath = Join-Path $RepoRoot "backend/internal/service/user.go"
  $frontendPath = Join-Path $RepoRoot "frontend/src/components/admin/user/UserAllowedGroupsModal.vue"

  if (-not (Test-Path $backendPath) -or -not (Test-Path $frontendPath)) {
    return $false
  }

  $backend = Read-TextFile -Path $backendPath
  $frontend = Read-TextFile -Path $frontendPath

  return (
    $backend.Contains("!isExclusive && len(u.AllowedGroups) == 0") -and
    $frontend.Contains('@change="toggleGroup(config.groupId)"') -and
    $frontend.Contains("const toggleGroup = (groupId: number) =>") -and
    $frontend.Contains("filter((c) => c.isSelected).map((c) => c.groupId)") -and
    $frontend.Contains("userAllowedGroups.length > 0 ? userAllowedGroups.includes(g.id) : true")
  )
}

function Test-UserGroupAllowlistFallbackCanApply {
  $backendPath = Join-Path $RepoRoot "backend/internal/service/user.go"
  $frontendPath = Join-Path $RepoRoot "frontend/src/components/admin/user/UserAllowedGroupsModal.vue"

  if (-not (Test-Path $backendPath) -or -not (Test-Path $frontendPath)) {
    return $false
  }

  $backend = Read-TextFile -Path $backendPath
  $frontend = Read-TextFile -Path $frontendPath

  return (
    $backend -match '(?s)// CanBindGroup checks whether a user can bind to a given group\..*?func \(u \*User\) SetPassword' -and
    $frontend.Contains('@change="toggleExclusiveGroup(config.groupId)"') -and
    $frontend.Contains("const toggleExclusiveGroup = (groupId: number) =>") -and
    $frontend.Contains("filter((c) => c.isExclusive && c.isSelected).map((c) => c.groupId)")
  )
}

function Apply-UserGroupAllowlistFallback {
  if ($PatchName -ne "001-user-group-allowlist.patch") {
    return $false
  }

  if (Test-UserGroupAllowlistFallbackApplied) {
    return $true
  }

  if (-not (Test-UserGroupAllowlistFallbackCanApply)) {
    return $false
  }

  $backendPath = Join-Path $RepoRoot "backend/internal/service/user.go"
  $frontendPath = Join-Path $RepoRoot "frontend/src/components/admin/user/UserAllowedGroupsModal.vue"

  $backend = Read-TextFile -Path $backendPath
  $backendReplacement = @'
// CanBindGroup checks whether a user can bind to a given group.
// For standard groups:
// - Empty AllowedGroups: public groups are available by default; exclusive groups need assignment.
// - Non-empty AllowedGroups: acts as an explicit allowlist for both public and exclusive groups.
func (u *User) CanBindGroup(groupID int64, isExclusive bool) bool {
	if !isExclusive && len(u.AllowedGroups) == 0 {
		return true
	}
	for _, id := range u.AllowedGroups {
		if id == groupID {
			return true
		}
	}
	return false
}

func (u *User) SetPassword
'@
  $backend = [regex]::Replace(
    $backend,
    '(?s)// CanBindGroup checks whether a user can bind to a given group\..*?func \(u \*User\) SetPassword',
    $backendReplacement,
    1
  )
  Write-TextFile -Path $backendPath -Content $backend

  $frontend = Read-TextFile -Path $frontendPath
  $frontend = $frontend.Replace('@change="toggleExclusiveGroup(config.groupId)"', '@change="toggleGroup(config.groupId)"')
  $frontend = $frontend.Replace(
    "isSelected: g.is_exclusive ? userAllowedGroups.includes(g.id) : true,",
    "isSelected: g.is_exclusive ? userAllowedGroups.includes(g.id) : (userAllowedGroups.length > 0 ? userAllowedGroups.includes(g.id) : true),"
  )
  $frontend = $frontend.Replace("const toggleExclusiveGroup = (groupId: number) =>", "const toggleGroup = (groupId: number) =>")
  $frontend = $frontend.Replace("if (config && config.isExclusive) {", "if (config) {")
  $frontend = $frontend.Replace(
    "const allowedGroups = groupConfigs.value.filter((c) => c.isExclusive && c.isSelected).map((c) => c.groupId)",
    "const allowedGroups = groupConfigs.value.filter((c) => c.isSelected).map((c) => c.groupId)"
  )

  $publicGroupCheckboxOld = @'
                  <div class="flex h-5 w-5 items-center justify-center rounded-md border-2 border-green-400 bg-green-500 dark:border-green-600 dark:bg-green-600">
                    <svg class="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
'@
  $publicGroupCheckboxNew = @'
                  <label class="relative flex h-6 w-6 cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      :checked="config.isSelected"
                      @change="toggleGroup(config.groupId)"
                      class="peer sr-only"
                    />
                    <div class="h-5 w-5 rounded-md border-2 border-gray-300 transition-all peer-checked:border-green-500 peer-checked:bg-green-500 dark:border-dark-500 peer-checked:dark:border-green-500">
                      <svg v-if="config.isSelected" class="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </label>
'@
  $frontend = $frontend.Replace($publicGroupCheckboxOld, $publicGroupCheckboxNew)
  Write-TextFile -Path $frontendPath -Content $frontend

  return (Test-UserGroupAllowlistFallbackApplied)
}

if (-not (Test-Path $PatchPath)) {
  [Console]::Error.WriteLine("Patch file not found: $PatchPath")
  exit 1
}

Push-Location $RepoRoot
try {
  if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    [Console]::Error.WriteLine("Run this script from inside the jiufeng-sub2api workspace. Missing backend or frontend folder.")
    exit 1
  }

  $checkArgs = @("apply", "--check", "--whitespace=nowarn", $PatchPath)
  $checkCode = Test-GitApply -Arguments $checkArgs

  if ($checkCode -eq 0) {
    if ($CheckOnly) {
      Write-Host "Patch can be applied: $PatchName" -ForegroundColor Green
      exit 0
    }

    $applyCode = Invoke-GitApply -Arguments @("apply", "--whitespace=nowarn", $PatchPath)
    if ($applyCode -ne 0) {
      [Console]::Error.WriteLine("Failed to apply patch: $PatchName")
      exit 1
    }

    Write-Host "Applied patch: $PatchName" -ForegroundColor Green
    exit 0
  }

  $reverseCode = Test-GitApply -Arguments @("apply", "--reverse", "--check", "--whitespace=nowarn", $PatchPath)
  if ($reverseCode -eq 0) {
    Write-Host "Patch is already applied: $PatchName" -ForegroundColor Yellow
    exit 0
  }

  if (Test-UserGroupAllowlistFallbackApplied) {
    Write-Host "Patch is already applied: $PatchName" -ForegroundColor Yellow
    exit 0
  }

  if ($CheckOnly) {
    if (Test-UserGroupAllowlistFallbackCanApply) {
      Write-Host "Patch can be applied with manual fallback: $PatchName" -ForegroundColor Yellow
      exit 0
    } else {
      [Console]::Error.WriteLine("Patch cannot be applied cleanly: $PatchName")
      exit 1
    }
  }

  Write-Host "Patch did not apply cleanly. Trying 3-way apply..." -ForegroundColor Yellow
  $threeWayCode = Invoke-GitApply -Arguments @("apply", "--3way", "--whitespace=nowarn", $PatchPath)
  if ($threeWayCode -ne 0) {
    Write-Host "3-way apply failed. Applying known rejected hunks manually..." -ForegroundColor Yellow
    if (Apply-UserGroupAllowlistFallback) {
      Write-Host "Applied patch with manual fallback: $PatchName" -ForegroundColor Green
      exit 0
    } else {
      [Console]::Error.WriteLine("Patch failed. Open $PatchName and apply the rejected hunks manually.")
      exit 1
    }
  }

  Write-Host "Applied patch with 3-way merge: $PatchName" -ForegroundColor Green
} finally {
  Pop-Location
}
