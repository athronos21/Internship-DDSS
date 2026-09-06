import 'package:flutter/material.dart';
import '../services/api_service.dart';

/// Visual Medicine Packaging Scanner & FEFO Batch Dispenser
/// Solves the problem where medicines lack barcodes or QR codes by visually
/// scanning the packaging (blister foil, box, bottle, vial, or ampoule) using Gemini AI.
class ScanAndSellScreen extends StatefulWidget {
  final ApiService? apiService;

  const ScanAndSellScreen({super.key, this.apiService});

  @override
  State<ScanAndSellScreen> createState() => _ScanAndSellScreenState();
}

class _ScanAndSellScreenState extends State<ScanAndSellScreen> {
  late final ApiService _apiService;
  bool _isAnalyzing = false;
  Map<String, dynamic>? _scannedMedicineResult;
  String _selectedDrugHint = 'Amoxil 500mg';

  @override
  void initState() {
    super.initState();
    _apiService = widget.apiService ?? ApiService();
  }

  Future<void> _scanMedicinePackaging(String drugName) async {
    setState(() {
      _isAnalyzing = true;
      _scannedMedicineResult = null;
      _selectedDrugHint = drugName;
    });

    try {
      const mockImage = 'data:image/jpeg;base64,...';
      final result = await _apiService.scanMedicineVisualPackaging(
        base64Image: mockImage,
        hint: drugName,
      );

      setState(() {
        _scannedMedicineResult = result;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ AI Detected: ${result['name']} • FEFO Batches Loaded!'),
          backgroundColor: const Color(0xFF0D9488),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Scanning failed: $e'), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isAnalyzing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D9488),
        elevation: 0,
        title: const Text(
          'Visual Packaging Scanner',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF042F2E),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF0D9488)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.camera_enhance, color: Color(0xFF2DD4BF), size: 24),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'AI recognizes physical medicines from their packaging label, crimp, or foil. No barcode/QR required!',
                      style: TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Viewfinder
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF0D9488), width: 2),
              ),
              child: Center(
                child: _isAnalyzing
                    ? const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: Color(0xFF2DD4BF)),
                          SizedBox(height: 12),
                          Text('Scanning Packaging with Gemini Vision...', style: TextStyle(color: Colors.white, fontSize: 12)),
                        ],
                      )
                    : Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.qr_code_scanner, size: 48, color: Color(0xFF2DD4BF)),
                          const SizedBox(height: 8),
                          const Text('POINT CAMERA AT MEDICINE PACKAGING', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                          Text('Blisters • Strips • Bottles • Boxes', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 10)),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 16),

            const Text(
              'Select Drug Packaging to Test:',
              style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _buildDrugButton('Amoxil 500mg'),
                _buildDrugButton('Paracetamol 500mg'),
                _buildDrugButton('Ciprofloxacin 500mg'),
                _buildDrugButton('Metformin 850mg'),
                _buildDrugButton('Omeprazole 20mg'),
              ],
            ),
            const SizedBox(height: 16),

            if (_scannedMedicineResult != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF059669)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _scannedMedicineResult!['name'] ?? '',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Generic: ${_scannedMedicineResult!['genericName'] ?? ''}',
                      style: const TextStyle(color: Color(0xFF2DD4BF), fontSize: 11),
                    ),
                    Text(
                      'Strength: ${_scannedMedicineResult!['strength']} • Form: ${_scannedMedicineResult!['dosageForm']}',
                      style: const TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                    Text(
                      'Internal SKU: ${_scannedMedicineResult!['generatedCode'] ?? ''}',
                      style: const TextStyle(color: Colors.white54, fontSize: 10),
                    ),
                    const Divider(color: Colors.white12, height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text(
                          'Price: ETB ${_scannedMedicineResult!['suggestedSellingPrice'] ?? 25}',
                          style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Stock: ${_scannedMedicineResult!['inStock'] ?? 50} units',
                          style: const TextStyle(color: Colors.white70, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDrugButton(String name) {
    return ActionChip(
      label: Text(name, style: const TextStyle(fontSize: 10, color: Colors.white)),
      backgroundColor: const Color(0xFF1E293B),
      side: const BorderSide(color: Color(0xFF0D9488)),
      onPressed: () => _scanMedicinePackaging(name),
    );
  }
}
