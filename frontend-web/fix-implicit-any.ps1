# TypeScript Implicit Any Fixer
# This script adds explicit type annotations to common patterns

$files = @(
    "src/components/analysis/HiveAnalysisCard.tsx",
    "src/components/frames/FrameStats.tsx",
    "src/components/hives/AddSuperDialog.tsx",
    "src/components/hives/HiveSetupWizard.tsx",
    "src/components/hives/HiveSplitWizard.tsx",
    "src/pages/admin/AdminDashboardPage.tsx",
    "src/pages/AnalyticsPage.tsx",
    "src/pages/context/ApiaryOverviewPage.tsx",
    "src/pages/context/HivesPage.tsx",
    "src/pages/DiseasesLibraryPage.tsx",
    "src/pages/HarvestPage.tsx",
    "src/pages/HealthPage.tsx",
    "src/pages/MergeHivePage.tsx",
    "src/pages/SplitHivePage.tsx",
    "src/pages/NewHarvestPage.tsx",
    "src/pages/ReportDiseasePage.tsx",
    "src/pages/HiveAnalysisPage.tsx",
    "src/pages/InspectionDetailPage.tsx",
    "src/pages/HarvestDetailPage.tsx",
    "src/pages/FloraPage.tsx",
    "src/pages/ForgotPasswordPage.tsx"
)

foreach ($file in $files) {
    $path = "d:\Kingdom-of-Bees\frontend-web\$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Common patterns
        $content = $content -replace '\.map\(([a-z]+) =>', '.map(($1: any) =>'
        $content = $content -replace '\.filter\(([a-z]+) =>', '.filter(($1: any) =>'
        $content = $content -replace '\.find\(([a-z]+) =>', '.find(($1: any) =>'
        $content = $content -replace '\.reduce\(([a-z]+), ([a-z]+) =>', '.reduce(($1: any, $2: any) =>'
        $content = $content -replace '\.forEach\(([a-z]+) =>', '.forEach(($1: any) =>'
        $content = $content -replace '\.some\(([a-z]+) =>', '.some(($1: any) =>'
        $content = $content -replace '\.every\(([a-z]+) =>', '.every(($1: any) =>'
        
        Set-Content $path $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

Write-Host "Done!"
