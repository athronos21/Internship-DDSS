$ErrorActionPreference = "Stop"

$docxPath = Join-Path $PSScriptRoot "..\documentation\Kaziniya_PIMS_Internship_Report.docx"
$pdfPath = Join-Path $PSScriptRoot "..\documentation\Kaziniya_PIMS_Internship_Report.pdf"
$publicPdfPath = Join-Path $PSScriptRoot "..\public\Kaziniya_PIMS_Internship_Report.pdf"

$docxPath = [System.IO.Path]::GetFullPath($docxPath)
$pdfPath = [System.IO.Path]::GetFullPath($pdfPath)
$publicPdfPath = [System.IO.Path]::GetFullPath($publicPdfPath)

Write-Host "Opening Word application..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
    Write-Host "Opening Document: $docxPath"
    $doc = $word.Documents.Open($docxPath)
    
    Write-Host "Exporting to PDF: $pdfPath"
    $doc.ExportAsFixedFormat($pdfPath, 17) # 17 = wdExportFormatPDF
    
    Write-Host "Exporting to Public PDF: $publicPdfPath"
    $doc.ExportAsFixedFormat($publicPdfPath, 17)
    
    $doc.Close([ref]$false)
    Write-Host "[SUCCESS] PDF generated successfully!"
}
finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
