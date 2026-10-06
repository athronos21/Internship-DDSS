$ErrorActionPreference = "Stop"

$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
    # 1. DDS Inventory Docx
    $docx1 = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\documentation\Kaziniya_DDS_Inventory_Internship_Report.docx"))
    $pdf1 = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\documentation\Kaziniya_DDS_Inventory_Internship_Report.pdf"))
    $pubPdf1 = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\public\Kaziniya_DDS_Inventory_Internship_Report.pdf"))
    
    Write-Host "Opening: $docx1"
    $doc1 = $word.Documents.Open($docx1)
    Write-Host "Exporting to PDF: $pdf1"
    $doc1.ExportAsFixedFormat($pdf1, 17)
    Write-Host "Exporting to Public: $pubPdf1"
    $doc1.ExportAsFixedFormat($pubPdf1, 17)
    $doc1.Close([ref]$false)

    # 2. PIMS Docx (synced copy)
    $docx2 = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\documentation\Kaziniya_PIMS_Internship_Report.docx"))
    $pdf2 = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\documentation\Kaziniya_PIMS_Internship_Report.pdf"))
    $pubPdf2 = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\public\Kaziniya_PIMS_Internship_Report.pdf"))

    Write-Host "Opening: $docx2"
    $doc2 = $word.Documents.Open($docx2)
    Write-Host "Exporting to PDF: $pdf2"
    $doc2.ExportAsFixedFormat($pdf2, 17)
    Write-Host "Exporting to Public: $pubPdf2"
    $doc2.ExportAsFixedFormat($pubPdf2, 17)
    $doc2.Close([ref]$false)

    Write-Host "[SUCCESS] All PDFs generated successfully!"
}
finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
