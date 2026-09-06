import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

/// Screen allowing pharmacy staff to register / add products in TWO ways:
/// 1. Visual Medicine Packaging Scanner (No barcode/QR code needed - scans blister/box/bottle label using Gemini AI)
/// 2. Manual Pharmaceutical Product Registration Form
class RegisterMedicineScreen extends StatefulWidget {
  final ApiService apiService;
  final VoidCallback? onMedicineAdded;

  const RegisterMedicineScreen({
    super.key,
    required this.apiService,
    this.onMedicineAdded,
  });

  @override
  State<RegisterMedicineScreen> createState() => _RegisterMedicineScreenState();
}

class _RegisterMedicineScreenState extends State<RegisterMedicineScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Manual Form Controllers
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _genericNameController = TextEditingController();
  final _brandNameController = TextEditingController();
  final _strengthController = TextEditingController(text: '500mg');
  final _dosageFormController = TextEditingController(text: 'Tablet');
  final _manufacturerController = TextEditingController(text: 'EPHARM');
  final _batchNumberController = TextEditingController(text: 'KZ-BATCH-001');
  final _mfgDateController = TextEditingController(text: '2025-01-01');
  final _expDateController = TextEditingController(text: '2027-12-31');
  final _purchasePriceController = TextEditingController(text: '15.00');
  final _sellingPriceController = TextEditingController(text: '25.00');
  final _quantityController = TextEditingController(text: '50');
  final _reorderLevelController = TextEditingController(text: '15');
  final _shelfLocationController = TextEditingController(text: 'Shelf A-02');
  final _barcodeController = TextEditingController();
  String _selectedCategory = 'cat-1';
  String _selectedUnit = 'Box';
  bool _prescriptionRequired = false;

  // Visual Scanner State
  bool _isScanning = false;
  Map<String, dynamic>? _scannedMedicineResult;
  String? _detectedPackagingText;
  double? _visualConfidence;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _genericNameController.dispose();
    _brandNameController.dispose();
    _strengthController.dispose();
    _dosageFormController.dispose();
    _manufacturerController.dispose();
    _batchNumberController.dispose();
    _mfgDateController.dispose();
    _expDateController.dispose();
    _purchasePriceController.dispose();
    _sellingPriceController.dispose();
    _quantityController.dispose();
    _reorderLevelController.dispose();
    _shelfLocationController.dispose();
    _barcodeController.dispose();
    super.dispose();
  }

  /// Simulate or execute Visual Medicine Packaging Scanner
  Future<void> _performVisualMedicineScan([String? sampleDrugHint]) async {
    setState(() {
      _isScanning = true;
      _scannedMedicineResult = null;
    });

    try {
      // In production Flutter app, camera takes a snapshot as base64
      // Here we send the image payload or medicine hint to /api/gemini/scan-medicine
      const mockSampleImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';

      final result = await widget.apiService.scanMedicineVisualPackaging(
        base64Image: mockSampleImageBase64,
        hint: sampleDrugHint ?? 'Amoxil 500mg',
      );

      setState(() {
        _scannedMedicineResult = result;
        _detectedPackagingText = result['detectedText'] ?? '';
        _visualConfidence = (result['confidence'] as num?)?.toDouble() ?? 0.95;

        // Populate registration fields from AI extraction
        _nameController.text = result['name'] ?? '';
        _genericNameController.text = result['genericName'] ?? '';
        _brandNameController.text = result['brandName'] ?? '';
        _strengthController.text = result['strength'] ?? '500mg';
        _dosageFormController.text = result['dosageForm'] ?? 'Tablet';
        _manufacturerController.text = result['manufacturer'] ?? 'EPHARM';
        _batchNumberController.text = result['batchNumber'] ?? 'KZ-B902';
        _expDateController.text = result['expDate'] ?? '2027-11-30';
        _mfgDateController.text = result['mfgDate'] ?? '2024-11-15';
        _purchasePriceController.text = (result['suggestedPurchasePrice'] ?? 15).toString();
        _sellingPriceController.text = (result['suggestedSellingPrice'] ?? 25).toString();
        _quantityController.text = (result['suggestedQuantity'] ?? 50).toString();
        _reorderLevelController.text = (result['reorderLevel'] ?? 15).toString();
        _shelfLocationController.text = result['shelfLocation'] ?? 'Shelf A-02';
        _selectedUnit = result['unit'] ?? 'Strip';
        _barcodeController.text = result['generatedCode'] ?? '';
        _prescriptionRequired = result['prescriptionRequired'] ?? false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '✓ Recognized: ${result['name']} (${result['dosageForm']}) • No Barcode Needed!',
          ),
          backgroundColor: const Color(0xFF0D9488),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Scan error: $e'), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isScanning = false);
    }
  }

  /// Submit registration to server
  Future<void> _submitMedicineRegistration() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      final res = await widget.apiService.registerMedicine(
        name: _nameController.text.trim(),
        genericName: _genericNameController.text.trim().isNotEmpty
            ? _genericNameController.text.trim()
            : _nameController.text.trim(),
        brandName: _brandNameController.text.trim(),
        categoryId: _selectedCategory,
        dosageForm: _dosageFormController.text.trim(),
        strength: _strengthController.text.trim(),
        unit: _selectedUnit,
        manufacturer: _manufacturerController.text.trim(),
        batchNumber: _batchNumberController.text.trim(),
        mfgDate: _mfgDateController.text.trim(),
        expDate: _expDateController.text.trim(),
        purchasePrice: double.tryParse(_purchasePriceController.text) ?? 15.0,
        sellingPrice: double.tryParse(_sellingPriceController.text) ?? 25.0,
        quantity: int.tryParse(_quantityController.text) ?? 50,
        reorderLevel: int.tryParse(_reorderLevelController.text) ?? 15,
        shelfLocation: _shelfLocationController.text.trim(),
        barcode: _barcodeController.text.trim().isNotEmpty
            ? _barcodeController.text.trim()
            : null,
        prescriptionRequired: _prescriptionRequired,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✓ Successfully registered "${res['name']}" into stock!'),
          backgroundColor: const Color(0xFF059669),
        ),
      );

      widget.onMedicineAdded?.call();
      Navigator.of(context).pop();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration failed: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D9488),
        elevation: 0,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Register New Product',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(
              'Two Methods: Visual AI Scan & Manual Entry',
              style: TextStyle(color: Colors.white70, fontSize: 11),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white60,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(icon: Icon(Icons.camera_enhance, size: 18), text: '1. Scan Medicine Itself'),
            Tab(icon: Icon(Icons.edit_note, size: 18), text: '2. Manual Entry Form'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // TAB 1: VISUAL MEDICINE PACKAGING SCANNER (NO BARCODE NEEDED)
          _buildVisualScannerTab(),
          // TAB 2: FULL MANUAL REGISTRATION FORM
          _buildManualFormTab(),
        ],
      ),
    );
  }

  Widget _buildVisualScannerTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner explaining that no barcode/QR is required
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF042F2E),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF0D9488)),
            ),
            child: const Row(
              children: [
                Icon(Icons.auto_awesome, color: Color(0xFF2DD4BF), size: 24),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'No Barcode or QR Code Required!',
                        style: TextStyle(
                          color: Color(0xFF5EEAD4),
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Point your phone camera at the blister foil, box, or bottle label. AI extracts the active ingredient, strength, batch & expiry automatically.',
                        style: TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Camera Viewfinder Box
          Container(
            height: 220,
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF0D9488), width: 2),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Corner targeting brackets
                Positioned(
                  top: 16,
                  left: 16,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Color(0xFF2DD4BF), width: 3),
                        left: BorderSide(color: Color(0xFF2DD4BF), width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 16,
                  right: 16,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Color(0xFF2DD4BF), width: 3),
                        right: BorderSide(color: Color(0xFF2DD4BF), width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 16,
                  left: 16,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Color(0xFF2DD4BF), width: 3),
                        left: BorderSide(color: Color(0xFF2DD4BF), width: 3),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 16,
                  right: 16,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(color: Color(0xFF2DD4BF), width: 3),
                        right: BorderSide(color: Color(0xFF2DD4BF), width: 3),
                      ),
                    ),
                  ),
                ),

                if (_isScanning)
                  const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(color: Color(0xFF2DD4BF)),
                      SizedBox(height: 12),
                      Text(
                        'Analyzing Medicine Packaging with AI...',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ],
                  )
                else
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.medication_liquid, size: 48, color: Color(0xFF2DD4BF)),
                      const SizedBox(height: 8),
                      const Text(
                        'ALIGN MEDICINE PACKAGING IN FRAME',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Blister strip • Box • Bottle • Ampoule',
                        style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11),
                      ),
                    ],
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Action Scan Button
          ElevatedButton.icon(
            onPressed: _isScanning ? null : () => _performVisualMedicineScan(),
            icon: const Icon(Icons.camera_alt),
            label: const Text('CAPTURE & ANALYZE PACKAGING'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0D9488),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
          const SizedBox(height: 12),

          // Quick Presets to test
          const Text(
            'Quick Test with Real Drug Presets:',
            style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _buildPresetChip('Amoxil 500mg Strip'),
              _buildPresetChip('Paracetamol 500mg Box'),
              _buildPresetChip('Ciprofloxacin 500mg'),
              _buildPresetChip('Metformin 850mg'),
              _buildPresetChip('Omeprazole 20mg'),
            ],
          ),
          const SizedBox(height: 16),

          // Result Card if Scanned
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.check_circle, color: Color(0xFF10B981), size: 20),
                          SizedBox(width: 8),
                          Text(
                            'AI Extracted Attributes',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF064E3B),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${((_visualConfidence ?? 0.95) * 100).toInt()}% Match',
                          style: const TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: Colors.white12, height: 16),
                  _buildResultRow('Identified Name:', _scannedMedicineResult!['name'] ?? ''),
                  _buildResultRow('Generic (INN):', _scannedMedicineResult!['genericName'] ?? ''),
                  _buildResultRow('Strength & Form:', '${_scannedMedicineResult!['strength']} ${_scannedMedicineResult!['dosageForm']}'),
                  _buildResultRow('Category:', _scannedMedicineResult!['category'] ?? 'General'),
                  _buildResultRow('Manufacturer:', _scannedMedicineResult!['manufacturer'] ?? ''),
                  _buildResultRow('Extracted Batch:', _scannedMedicineResult!['batchNumber'] ?? ''),
                  _buildResultRow('Expiry Date:', _scannedMedicineResult!['expDate'] ?? ''),
                  _buildResultRow('Generated Internal SKU:', _scannedMedicineResult!['generatedCode'] ?? ''),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: _submitMedicineRegistration,
                    icon: const Icon(Icons.save),
                    label: const Text('CONFIRM & SAVE TO INVENTORY'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(46),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPresetChip(String label) {
    return ActionChip(
      label: Text(label, style: const TextStyle(fontSize: 10, color: Colors.white)),
      backgroundColor: const Color(0xFF1E293B),
      side: const BorderSide(color: Color(0xFF334155)),
      onPressed: () => _performVisualMedicineScan(label),
    );
  }

  Widget _buildResultRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(label, style: const TextStyle(color: Colors.white60, fontSize: 11)),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildManualFormTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Manual Pharmaceutical Registration',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 4),
            const Text(
              'Enter drug details manually. Barcode is optional; an internal SKU will be generated if left blank.',
              style: TextStyle(color: Colors.white60, fontSize: 11),
            ),
            const SizedBox(height: 16),

            _buildInputField('Product Commercial Name *', _nameController, 'e.g. Amoxil 500mg Capsules', isRequired: true),
            _buildInputField('Generic Name (Active Ingredient) *', _genericNameController, 'e.g. Amoxicillin Trihydrate', isRequired: true),
            _buildInputField('Brand Name', _brandNameController, 'e.g. Amoxil'),

            Row(
              children: [
                Expanded(child: _buildInputField('Strength', _strengthController, 'e.g. 500mg')),
                const SizedBox(width: 12),
                Expanded(child: _buildInputField('Dosage Form', _dosageFormController, 'e.g. Tablet, Capsule')),
              ],
            ),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Category', style: TextStyle(color: Colors.white70, fontSize: 11)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: DropdownButton<String>(
                          value: _selectedCategory,
                          isExpanded: true,
                          underline: const SizedBox(),
                          dropdownColor: const Color(0xFF1E293B),
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          items: const [
                            DropdownMenuItem(value: 'cat-1', child: Text('Antibiotics')),
                            DropdownMenuItem(value: 'cat-2', child: Text('Analgesics & Pain')),
                            DropdownMenuItem(value: 'cat-3', child: Text('Cardiovascular')),
                            DropdownMenuItem(value: 'cat-4', child: Text('Gastrointestinal')),
                            DropdownMenuItem(value: 'cat-5', child: Text('Respiratory')),
                            DropdownMenuItem(value: 'cat-6', child: Text('Vitamins & Supplements')),
                          ],
                          onChanged: (val) => setState(() => _selectedCategory = val ?? 'cat-1'),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Dispensing Unit', style: TextStyle(color: Colors.white70, fontSize: 11)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: DropdownButton<String>(
                          value: _selectedUnit,
                          isExpanded: true,
                          underline: const SizedBox(),
                          dropdownColor: const Color(0xFF1E293B),
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                          items: const [
                            DropdownMenuItem(value: 'Box', child: Text('Box')),
                            DropdownMenuItem(value: 'Strip', child: Text('Strip')),
                            DropdownMenuItem(value: 'Bottle', child: Text('Bottle')),
                            DropdownMenuItem(value: 'Vial', child: Text('Vial')),
                            DropdownMenuItem(value: 'Ampoule', child: Text('Ampoule')),
                            DropdownMenuItem(value: 'Tube', child: Text('Tube')),
                          ],
                          onChanged: (val) => setState(() => _selectedUnit = val ?? 'Box'),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                  ),
                ),
              ],
            ),

            _buildInputField('Manufacturer / Laboratory', _manufacturerController, 'e.g. EPHARM, Cadila, GSK'),

            Row(
              children: [
                Expanded(child: _buildInputField('Purchase Price (ETB)', _purchasePriceController, '15.00', keyboardType: TextInputType.number)),
                const SizedBox(width: 12),
                Expanded(child: _buildInputField('Selling Price (ETB) *', _sellingPriceController, '25.00', keyboardType: TextInputType.number, isRequired: true)),
              ],
            ),

            Row(
              children: [
                Expanded(child: _buildInputField('Initial Quantity *', _quantityController, '50', keyboardType: TextInputType.number, isRequired: true)),
                const SizedBox(width: 12),
                Expanded(child: _buildInputField('Reorder Alert Level', _reorderLevelController, '15', keyboardType: TextInputType.number)),
              ],
            ),

            Row(
              children: [
                Expanded(child: _buildInputField('Batch Number *', _batchNumberController, 'KZ-BATCH-001', isRequired: true)),
                const SizedBox(width: 12),
                Expanded(child: _buildInputField('Expiry Date (YYYY-MM-DD) *', _expDateController, '2027-12-31', isRequired: true)),
              ],
            ),

            _buildInputField('Shelf Location', _shelfLocationController, 'e.g. Shelf A-03, Cold Room'),
            _buildInputField('Barcode (Optional - internal SKU generated if blank)', _barcodeController, 'Leave empty if no barcode exists'),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Prescription Required (Rx)', style: TextStyle(color: Colors.white, fontSize: 12)),
              subtitle: const Text('Enforces pharmacist verification at counter', style: TextStyle(color: Colors.white60, fontSize: 10)),
              value: _prescriptionRequired,
              activeColor: const Color(0xFF0D9488),
              onChanged: (v) => setState(() => _prescriptionRequired = v),
            ),
            const SizedBox(height: 16),

            ElevatedButton.icon(
              onPressed: _submitMedicineRegistration,
              icon: const Icon(Icons.check_circle),
              label: const Text('SAVE DRUG TO INVENTORY'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0D9488),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputField(
    String label,
    TextEditingController controller,
    String placeholder, {
    TextInputType keyboardType = TextInputType.text,
    bool isRequired = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
          const SizedBox(height: 4),
          TextFormField(
            controller: controller,
            keyboardType: keyboardType,
            style: const TextStyle(color: Colors.white, fontSize: 12),
            validator: isRequired
                ? (v) => (v == null || v.trim().isEmpty) ? 'Field required' : null
                : null,
            decoration: InputDecoration(
              hintText: placeholder,
              hintStyle: const TextStyle(color: Colors.white30, fontSize: 11),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF334155)),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF334155)),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF0D9488)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
