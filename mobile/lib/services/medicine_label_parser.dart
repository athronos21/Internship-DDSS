import 'package:string_similarity/string_similarity.dart';

/// Structured result of an on-device parsed medicine packaging label.
class ScannedMedicineData {
  final String name;
  final String genericName;
  final String brandName;
  final String strength;
  final String dosageForm;
  final String batchNumber;
  final String expDate;
  final String mfgDate;
  final String manufacturer;
  final String suggestedCategory;
  final String suggestedUnit;
  final double confidence;
  final String rawText;
  final List<String> detectedKeywords;

  // Field locking status for multi-frame continuous accumulation
  final bool nameLocked;
  final bool strengthLocked;
  final bool dosageFormLocked;
  final bool batchLocked;
  final bool expDateLocked;
  final bool manufacturerLocked;

  const ScannedMedicineData({
    required this.name,
    required this.genericName,
    required this.brandName,
    required this.strength,
    required this.dosageForm,
    required this.batchNumber,
    required this.expDate,
    required this.mfgDate,
    required this.manufacturer,
    this.suggestedCategory = 'cat-1',
    this.suggestedUnit = 'Box',
    this.confidence = 0.85,
    required this.rawText,
    this.detectedKeywords = const [],
    this.nameLocked = false,
    this.strengthLocked = false,
    this.dosageFormLocked = false,
    this.batchLocked = false,
    this.expDateLocked = false,
    this.manufacturerLocked = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'genericName': genericName,
      'brandName': brandName,
      'strength': strength,
      'dosageForm': dosageForm,
      'batchNumber': batchNumber,
      'expDate': expDate,
      'mfgDate': mfgDate,
      'manufacturer': manufacturer,
      'suggestedCategory': suggestedCategory,
      'unit': suggestedUnit,
      'confidence': confidence,
      'detectedText': rawText,
      'keywords': detectedKeywords,
      'fieldStatus': {
        'nameLocked': nameLocked,
        'strengthLocked': strengthLocked,
        'dosageFormLocked': dosageFormLocked,
        'batchLocked': batchLocked,
        'expDateLocked': expDateLocked,
        'manufacturerLocked': manufacturerLocked,
      },
    };
  }
}

/// Offline, deterministic pharmaceutical packaging parser.
/// Extracts medicine names, strengths, expiration dates, and batch codes from raw OCR text blocks.
class MedicineLabelParser {
  // Known standard pharmaceutical dosage forms
  static const List<String> _dosageForms = [
    'Tablet',
    'Capsule',
    'Suspension',
    'Syrup',
    'Injection',
    'Ointment',
    'Cream',
    'Drops',
    'Inhaler',
    'Gel',
    'Suppository',
    'Solution',
    'Powder',
    'Vial',
    'Ampoule',
    'Spray',
  ];

  // Common pharmaceutical manufacturer patterns and names
  static const List<String> _knownManufacturers = [
    'EPHARM',
    'Cadila',
    'GlaxoSmithKline',
    'GSK',
    'Julphar',
    'Novartis',
    'Sanofi',
    'Pfizer',
    'Cipla',
    'Sun Pharma',
    'AstraZeneca',
    'Roche',
    'Bayer',
    'MedTech',
    'Ethiopian Pharmaceuticals',
  ];

  // Common active pharmaceutical ingredients (INN)
  static const List<String> _commonActiveIngredients = [
    'amoxicillin',
    'clavulanate',
    'paracetamol',
    'acetaminophen',
    'ibuprofen',
    'ciprofloxacin',
    'metformin',
    'azithromycin',
    'omeprazole',
    'atorvastatin',
    'amlodipine',
    'losartan',
    'hydrocortisone',
    'cetirizine',
    'diclofenac',
    'ampicillin',
    'doxycycline',
    'erythromycin',
    'fluconazole',
    'gentamicin',
    'metronidazole',
    'salbutamol',
    'tramadol',
    'pantoprazole',
    'esomeprazole',
    'levofloxacin',
    'ceftriaxone',
    'cefixime',
    'artemether',
    'lumefantrine',
  ];

  // Common noise words found on medical packaging that should NOT be picked as the drug name
  static const Set<String> _noisePhrases = {
    'rx only',
    'prescription only',
    'keep out of reach of children',
    'keep out of reach',
    'store below',
    'store in a cool',
    'store at',
    'for oral use',
    'for external use only',
    'shake well before use',
    'protect from light',
    'each tablet contains',
    'each capsule contains',
    'each ml contains',
    'net contents',
    'dosage as directed',
    'manufactured by',
    'mfg by',
    'packed by',
    'marketed by',
    'mfg. lic. no',
    'mfg lic no',
    'reg. no',
    'reg no',
    'exp date',
    'mfg date',
    'batch no',
    'caution',
    'warning',
  };

  // Month abbreviations map for dates like "EXP: MAY 2027"
  static const Map<String, String> _monthMap = {
    'jan': '01',
    'feb': '02',
    'mar': '03',
    'apr': '04',
    'may': '05',
    'jun': '06',
    'jul': '07',
    'aug': '08',
    'sep': '09',
    'oct': '10',
    'nov': '11',
    'dec': '12',
  };

  /// Parses the raw OCR text string into structured [ScannedMedicineData].
  /// Optionally accepts [knownProducts] (existing formulary list) to perform fuzzy name matching.
  static ScannedMedicineData parse(
    String rawText, {
    List<Map<String, dynamic>>? knownProducts,
  }) {
    final cleanText = rawText.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
    final lines = cleanText
        .split('\n')
        .map((l) => l.trim())
        .where((l) => l.isNotEmpty)
        .toList();

    final keywordsFound = <String>[];

    // 1. Extract Expiry Date
    final expDate = _extractExpiryDate(cleanText, keywordsFound);

    // 2. Extract Manufacturing Date
    final mfgDate = _extractMfgDate(cleanText, keywordsFound);

    // 3. Extract Batch / Lot Number
    final batchNumber = _extractBatchNumber(cleanText, keywordsFound);

    // 4. Extract Strength (e.g. 500mg, 250mg/5ml, 1g)
    final strength = _extractStrength(cleanText, keywordsFound);

    // 5. Extract Dosage Form (e.g. Tablet, Capsule, Syrup)
    final dosageForm = _extractDosageForm(cleanText, keywordsFound);

    // 6. Extract Manufacturer
    final manufacturer = _extractManufacturer(cleanText, lines, keywordsFound);

    // 7. Extract Name and Generic Name (with optional Formulary Fuzzy Match)
    final nameResult = _extractMedicineName(
      lines: lines,
      strength: strength,
      dosageForm: dosageForm,
      knownProducts: knownProducts,
    );

    // Unit inference
    String unit = 'Box';
    final lowerText = cleanText.toLowerCase();
    final lowerForm = dosageForm.toLowerCase();
    if (lowerForm.contains('syrup') ||
        lowerForm.contains('suspension') ||
        lowerForm.contains('solution') ||
        lowerForm.contains('drops')) {
      unit = 'Bottle';
    } else if (lowerForm.contains('injection') || lowerForm.contains('vial')) {
      unit = 'Vial';
    } else if (lowerForm.contains('ointment') ||
        lowerForm.contains('cream') ||
        lowerForm.contains('gel')) {
      unit = 'Tube';
    } else if (lowerText.contains('strip')) {
      unit = 'Strip';
    }

    final hasName = nameResult['name'] != null &&
        nameResult['name']!.isNotEmpty &&
        nameResult['name'] != 'Unidentified Medicine';
    final hasStrength = strength.isNotEmpty;
    final hasForm = dosageForm.isNotEmpty;
    final hasBatch = batchNumber.isNotEmpty;
    final hasExp = expDate.isNotEmpty;
    final hasMfg = manufacturer.isNotEmpty;

    // Confidence calculation
    double score = 0.40;
    if (hasName) score += 0.25;
    if (hasStrength) score += 0.15;
    if (hasExp) score += 0.10;
    if (hasBatch) score += 0.10;
    final finalConfidence = score.clamp(0.40, 0.98);

    return ScannedMedicineData(
      name: nameResult['name'] ?? 'Unidentified Medicine',
      genericName: nameResult['genericName'] ?? nameResult['name'] ?? '',
      brandName: nameResult['brandName'] ?? '',
      strength: strength.isNotEmpty ? strength : '500mg',
      dosageForm: dosageForm.isNotEmpty ? dosageForm : 'Tablet',
      batchNumber: batchNumber.isNotEmpty ? batchNumber : '',
      expDate: expDate.isNotEmpty ? expDate : '',
      mfgDate: mfgDate.isNotEmpty ? mfgDate : '',
      manufacturer: manufacturer.isNotEmpty ? manufacturer : '',
      suggestedCategory: nameResult['category'] ?? 'cat-1',
      suggestedUnit: unit,
      confidence: finalConfidence,
      rawText: rawText,
      detectedKeywords: keywordsFound,
      nameLocked: hasName,
      strengthLocked: hasStrength,
      dosageFormLocked: hasForm,
      batchLocked: hasBatch,
      expDateLocked: hasExp,
      manufacturerLocked: hasMfg,
    );
  }

  /// Multi-Frame Accumulator: Merges newly detected frame text into the existing accumulated state.
  /// Prevents previously locked attributes (e.g. Name/Strength from front) from being lost
  /// when the user turns the box to scan the crimp/flap for Batch and Expiry.
  static ScannedMedicineData accumulateAndParse(
    ScannedMedicineData? current,
    String newFrameText, {
    List<Map<String, dynamic>>? knownProducts,
  }) {
    final newParsed = parse(newFrameText, knownProducts: knownProducts);

    if (current == null) {
      return newParsed;
    }

    // Merge detected keywords
    final mergedKeywords = Set<String>.from(current.detectedKeywords)
      ..addAll(newParsed.detectedKeywords);

    final mergedRawText = '${current.rawText}\n---\n$newFrameText';

    // Keep locked fields from current if new frame didn't find or has generic name
    final name = (current.nameLocked && current.name != 'Unidentified Medicine')
        ? current.name
        : (newParsed.name != 'Unidentified Medicine' ? newParsed.name : current.name);

    final genericName = (current.nameLocked && current.genericName.isNotEmpty)
        ? current.genericName
        : (newParsed.genericName.isNotEmpty ? newParsed.genericName : current.genericName);

    final brandName = (current.nameLocked && current.brandName.isNotEmpty)
        ? current.brandName
        : (newParsed.brandName.isNotEmpty ? newParsed.brandName : current.brandName);

    final strength = current.strengthLocked
        ? current.strength
        : (newParsed.strengthLocked ? newParsed.strength : current.strength);

    final dosageForm = current.dosageFormLocked
        ? current.dosageForm
        : (newParsed.dosageFormLocked ? newParsed.dosageForm : current.dosageForm);

    final batchNumber = current.batchLocked
        ? current.batchNumber
        : (newParsed.batchLocked ? newParsed.batchNumber : current.batchNumber);

    final expDate = current.expDateLocked
        ? current.expDate
        : (newParsed.expDateLocked ? newParsed.expDate : current.expDate);

    final mfgDate = current.mfgDate.isNotEmpty ? current.mfgDate : newParsed.mfgDate;

    final manufacturer = current.manufacturerLocked
        ? current.manufacturer
        : (newParsed.manufacturerLocked ? newParsed.manufacturer : current.manufacturer);

    final unit = newParsed.suggestedUnit != 'Box' ? newParsed.suggestedUnit : current.suggestedUnit;
    final category = current.suggestedCategory != 'cat-1' ? current.suggestedCategory : newParsed.suggestedCategory;

    int lockedCount = 0;
    if (name.isNotEmpty && name != 'Unidentified Medicine') lockedCount++;
    if (strength.isNotEmpty) lockedCount++;
    if (dosageForm.isNotEmpty) lockedCount++;
    if (batchNumber.isNotEmpty) lockedCount++;
    if (expDate.isNotEmpty) lockedCount++;
    if (manufacturer.isNotEmpty) lockedCount++;

    final mergedConfidence = (0.40 + lockedCount * 0.10).clamp(0.40, 0.98);

    return ScannedMedicineData(
      name: name,
      genericName: genericName,
      brandName: brandName,
      strength: strength,
      dosageForm: dosageForm,
      batchNumber: batchNumber,
      expDate: expDate,
      mfgDate: mfgDate,
      manufacturer: manufacturer,
      suggestedCategory: category,
      suggestedUnit: unit,
      confidence: mergedConfidence,
      rawText: mergedRawText,
      detectedKeywords: mergedKeywords.toList(),
      nameLocked: name.isNotEmpty && name != 'Unidentified Medicine',
      strengthLocked: strength.isNotEmpty,
      dosageFormLocked: dosageForm.isNotEmpty,
      batchLocked: batchNumber.isNotEmpty,
      expDateLocked: expDate.isNotEmpty,
      manufacturerLocked: manufacturer.isNotEmpty,
    );
  }

  /// Extracts Expiry Date using pharmaceutical regex patterns,
  /// including dot-matrix print, spaced letters, and crimp edge patterns.
  static String _extractExpiryDate(String text, List<String> keywords) {
    // Clean spaced dot-matrix characters: "E X P", "E . X . P"
    final prepped = text
        .replaceAll(RegExp(r'E\s*X\s*P(?:\s*I\s*R\s*Y)?', caseSensitive: false), 'EXP')
        .replaceAll(RegExp(r'U\s*S\s*E\s*B\s*Y', caseSensitive: false), 'USE BY')
        .replaceAll(RegExp(r'V\s*A\s*L(?:\s*I\s*D)?', caseSensitive: false), 'VAL')
        .replaceAll(RegExp(r'B\s*B\s*D', caseSensitive: false), 'BBD');

    final regexes = [
      // Format 1: EXP: YYYY-MM-DD or YYYY/MM/DD
      RegExp(r'(?:EXP(?:IRY)?|USE\s*BY|VAL(?:ID)?|BBD|E\.D\.?)[\s.:/]*([2-9]\d{3})[/-]([0-1]?\d)[/-]([0-3]?\d)\b', caseSensitive: false),
      // Format 2: EXP: DD/MM/YYYY or DD-MM-YYYY
      RegExp(r'(?:EXP(?:IRY)?|USE\s*BY|VAL(?:ID)?|BBD|E\.D\.?)[\s.:/]*([0-3]?\d)[/-]([0-1]?\d)[/-]((?:20)?[2-9]\d)\b', caseSensitive: false),
      // Format 3: EXP: MM/YYYY or MM/YY or MM.YYYY or MM-YYYY (dot-matrix print)
      RegExp(r'(?:EXP(?:IRY)?|USE\s*BY|VAL(?:ID)?|BBD|E\.D\.?|EXP\.?DT)[\s.:/]*([0-1]?\d)[\s./-]+((?:20)?[2-9]\d)\b', caseSensitive: false),
      // Format 4: EXP Month YYYY (e.g. EXP: MAY 2027 or EXP 05 2027 or EXP. OCT 27)
      RegExp(r'(?:EXP(?:IRY)?|USE\s*BY|VAL(?:ID)?|BBD|E\.D\.?)[\s.:/]*([a-z]{3,9})[\s./-]*((?:20)?[2-9]\d)\b', caseSensitive: false),
      // Format 5: Standalone date with EXP on prior line
      RegExp(r'\b(?:EXP|EXPIRY)[\s.:]*\n?\s*([0-1]?\d[/-](?:20)?[2-9]\d)\b', caseSensitive: false),
    ];

    for (final reg in regexes) {
      final match = reg.firstMatch(prepped);
      if (match != null) {
        final res = _normalizeDate(match);
        if (res.isNotEmpty) {
          keywords.add('Expiry: $res');
          return res;
        }
      }
    }

    // Format 6: Standalone future date on crimp/foil (e.g. "09/2027" or "11-2028")
    final standalone = RegExp(r'\b([0-1]\d)[\s./-]((?:20)?[2-9]\d)\b').firstMatch(prepped);
    if (standalone != null) {
      final m = int.tryParse(standalone.group(1)!) ?? 0;
      var yStr = standalone.group(2)!;
      if (yStr.length == 2) yStr = '20$yStr';
      final y = int.tryParse(yStr) ?? 0;
      final currentYear = DateTime.now().year;
      if (m >= 1 && m <= 12 && y >= currentYear && y <= currentYear + 10) {
        final res = _normalizeDate(standalone);
        if (res.isNotEmpty) {
          keywords.add('Expiry: $res (Crimp)');
          return res;
        }
      }
    }

    return '';
  }

  /// Extracts Manufacturing Date.
  static String _extractMfgDate(String text, List<String> keywords) {
    final prepped = text
        .replaceAll(RegExp(r'M\s*F\s*G', caseSensitive: false), 'MFG')
        .replaceAll(RegExp(r'P\s*R\s*O\s*D', caseSensitive: false), 'PROD')
        .replaceAll(RegExp(r'M\s*F\s*R', caseSensitive: false), 'MFR');

    final regexes = [
      RegExp(r'(?:MFG|MFR|PROD(?:UCTION)?|M\.D\.?|DATE)[\s.:/]*([2-9]\d{3}[/-][0-1]\d[/-][0-3]\d)', caseSensitive: false),
      RegExp(r'(?:MFG|MFR|PROD(?:UCTION)?|M\.D\.?)[\s.:/]*([0-1]?\d)[\s./-]+((?:20)?[1-9]\d)\b', caseSensitive: false),
      RegExp(r'(?:MFG|MFR|PROD(?:UCTION)?|M\.D\.?)[\s.:/]*([a-z]{3,9})[\s./-]*((?:20)?[1-9]\d)\b', caseSensitive: false),
    ];

    for (final reg in regexes) {
      final match = reg.firstMatch(prepped);
      if (match != null) {
        final res = _normalizeDate(match);
        if (res.isNotEmpty) {
          keywords.add('Mfg: $res');
          return res;
        }
      }
    }

    return '';
  }

  /// Extracts Batch or Lot Number, explicitly excluding Manufacturing License Numbers.
  static String _extractBatchNumber(String text, List<String> keywords) {
    final prepped = text
        .replaceAll(RegExp(r'B\s*\.\s*N\s*O\s*\.?', caseSensitive: false), 'B.NO.')
        .replaceAll(RegExp(r'B\s*\/\s*N', caseSensitive: false), 'BN')
        .replaceAll(RegExp(r'L\s*O\s*T', caseSensitive: false), 'LOT');

    // Strip out license numbers so they are never classified as batch number
    final withoutLic = prepped.replaceAll(
      RegExp(r'(?:mfg\.?\s*lic\.?\s*no\.?|lic\.?\s*no\.?|reg\.?\s*no\.?)[\s.:]*[^\n]+', caseSensitive: false),
      '',
    );

    final batchRegexes = [
      RegExp(r'(?:B\.NO\.?|BATCH(?:\s*NO)?|LOT(?:\s*NO)?|BN)[\s.:/]*([A-Z0-9\-_]{3,18})\b', caseSensitive: false),
      RegExp(r'(?:B\/N|L\/N|B-NO)[\s.:/]*([A-Z0-9\-_]{3,18})\b', caseSensitive: false),
      RegExp(r'\b(?:BATCH|LOT)[\s.:]*\n\s*([A-Z0-9\-_]{3,16})\b', caseSensitive: false),
    ];

    for (final reg in batchRegexes) {
      final match = reg.firstMatch(withoutLic);
      if (match != null && match.groupCount >= 1) {
        final val = match.group(1)!.trim().replaceAll(RegExp(r'[^A-Za-z0-9\-_]'), '');
        if (val.length >= 3) {
          keywords.add('Batch: $val');
          return val;
        }
      }
    }

    return '';
  }

  /// Extracts pharmaceutical strength (e.g. 500mg, 250mg/5ml, 1g, 0.5%).
  static String _extractStrength(String text, List<String> keywords) {
    // Normalize spaced digits: e.g. "5 0 0 m g" -> "500mg"
    final prepped = text.replaceAllMapped(RegExp(r'(\d)\s+(\d)'), (m) => '${m[1]}${m[2]}');

    final strengthRegex = RegExp(
      r'\b(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|iu|%)(?:\s*\/\s*\d*(?:\.\d+)?\s*(?:ml|mg|g))?)\b',
      caseSensitive: false,
    );

    final matches = strengthRegex.allMatches(prepped);
    for (final match in matches) {
      final val = match.group(0)!.trim();
      keywords.add('Strength: $val');
      return val.replaceAll(' ', '');
    }

    return '';
  }

  /// Extracts dosage form from pharmaceutical dictionary.
  static String _extractDosageForm(String text, List<String> keywords) {
    final lowerText = text.toLowerCase();
    for (final form in _dosageForms) {
      final formLower = form.toLowerCase();
      final regex = RegExp('\\b$formLower(?:s)?\\b', caseSensitive: false);
      if (regex.hasMatch(lowerText)) {
        keywords.add('Form: $form');
        return form;
      }
    }
    return '';
  }

  /// Extracts manufacturer.
  static String _extractManufacturer(
    String text,
    List<String> lines,
    List<String> keywords,
  ) {
    final lowerText = text.toLowerCase();

    for (final mfg in _knownManufacturers) {
      if (lowerText.contains(mfg.toLowerCase())) {
        keywords.add('Manufacturer: $mfg');
        return mfg;
      }
    }

    final mfgByRegex = RegExp(r'(?:Mfg|Manufactured|Packed|Marketed)\s*by[\s.:]*([A-Za-z0-9\s.,]{3,45})', caseSensitive: false);
    final match = mfgByRegex.firstMatch(text);
    if (match != null && match.groupCount >= 1) {
      final candidate = match.group(1)!.trim().split('\n').first.trim();
      if (candidate.length > 3) {
        keywords.add('Manufacturer: $candidate');
        return candidate;
      }
    }

    for (final line in lines) {
      final l = line.toLowerCase();
      if ((l.contains('pharma') || l.contains('laborat') || l.contains('plc') || l.contains('ltd')) &&
          !l.contains('store') &&
          !l.contains('reach') &&
          !l.contains('direct')) {
        keywords.add('Manufacturer: ${line.trim()}');
        return line.trim();
      }
    }

    return '';
  }

  /// Identifies the product name and generic name.
  static Map<String, String> _extractMedicineName({
    required List<String> lines,
    required String strength,
    required String dosageForm,
    List<Map<String, dynamic>>? knownProducts,
  }) {
    if (knownProducts != null && knownProducts.isNotEmpty) {
      double highestSimilarity = 0.0;
      Map<String, dynamic>? bestMatch;

      for (final line in lines) {
        if (_isNoiseLine(line)) continue;
        final cleanLine = _stripStrengthAndForm(line, strength, dosageForm);

        for (final product in knownProducts) {
          final pName = (product['name'] as String? ?? '').toLowerCase();
          final pGen = (product['genericName'] as String? ?? '').toLowerCase();

          final simName = cleanLine.toLowerCase().similarityTo(pName);
          final simGen = cleanLine.toLowerCase().similarityTo(pGen);
          final sim = simName > simGen ? simName : simGen;

          if (sim > highestSimilarity) {
            highestSimilarity = sim;
            bestMatch = product;
          }
        }
      }

      if (highestSimilarity >= 0.58 && bestMatch != null) {
        return {
          'name': bestMatch['name'] ?? '',
          'genericName': bestMatch['genericName'] ?? bestMatch['name'] ?? '',
          'brandName': bestMatch['brandName'] ?? bestMatch['name'] ?? '',
          'category': bestMatch['categoryId'] ?? 'cat-1',
        };
      }
    }

    final candidateLines = lines.where((line) {
      if (line.length < 3) return false;
      if (_isNoiseLine(line)) return false;
      if (RegExp(r'(?:EXP|MFG|BATCH|LOT|B\.NO|PRICE|ETB|\$|USD)', caseSensitive: false).hasMatch(line)) {
        return false;
      }
      return true;
    }).toList();

    if (candidateLines.isEmpty) {
      return {'name': 'Unidentified Medicine', 'genericName': 'Active Ingredient'};
    }

    // Check if any line or text contains a known common active pharmaceutical ingredient (INN)
    String detectedGeneric = '';
    for (final line in lines) {
      final l = line.toLowerCase();
      for (final ing in _commonActiveIngredients) {
        if (RegExp('\\b$ing\\b', caseSensitive: false).hasMatch(l)) {
          detectedGeneric = ing[0].toUpperCase() + ing.substring(1);
          break;
        }
      }
      if (detectedGeneric.isNotEmpty) break;
    }

    String primaryName = candidateLines.first.trim().replaceAll(RegExp(r'[,.;:]$'), '');
    String genericName = detectedGeneric.isNotEmpty ? detectedGeneric : primaryName;
    String brandName = primaryName;

    if (detectedGeneric.isEmpty && candidateLines.length > 1) {
      final secondary = candidateLines[1].trim();
      var cleaned = _stripStrengthAndForm(secondary, strength, dosageForm);
      cleaned = cleaned.replaceAll(RegExp(r'\b(?:BP|USP|IP|Ph\.?\s*Eur)\b', caseSensitive: false), '').replaceAll(RegExp(r'[,.;:]$'), '').trim();
      if (cleaned.length >= 3 && !_isNoiseLine(cleaned)) {
        genericName = cleaned;
      }
    }

    return {
      'name': primaryName,
      'genericName': genericName,
      'brandName': brandName,
    };
  }

  static bool _isNoiseLine(String line) {
    final lower = line.toLowerCase().trim();
    for (final phrase in _noisePhrases) {
      if (lower.contains(phrase)) return true;
    }
    if (RegExp(r'^[\d\s\-_.,/]+$').hasMatch(lower)) return true;
    return false;
  }

  static String _stripStrengthAndForm(String text, String strength, String form) {
    var result = text;
    if (strength.isNotEmpty) {
      result = result.replaceAll(RegExp(RegExp.escape(strength), caseSensitive: false), '');
    }
    if (form.isNotEmpty) {
      result = result.replaceAll(RegExp('\\b${RegExp.escape(form)}(?:s)?\\b', caseSensitive: false), '');
    }
    return result.trim();
  }

  /// Normalizes matched regex components into a clean YYYY-MM-DD date.
  static String _normalizeDate(Match match) {
    // If full 3 parts: YYYY-MM-DD or DD/MM/YYYY
    if (match.groupCount >= 3 && match.group(3) != null) {
      var g1 = match.group(1)!.trim();
      var g2 = match.group(2)!.trim();
      var g3 = match.group(3)!.trim();

      // Check if g1 is year (4 digits)
      if (g1.length == 4) {
        final y = g1;
        final m = g2.padLeft(2, '0');
        final d = g3.padLeft(2, '0');
        return '$y-$m-$d';
      }

      // If g3 is year
      var y = g3;
      if (y.length == 2) y = '20$y';
      final d = g1.padLeft(2, '0');
      final m = g2.padLeft(2, '0');
      return '$y-$m-$d';
    }

    // MM and YY/YYYY
    if (match.groupCount >= 2 && match.group(2) != null) {
      var month = match.group(1)!.trim().toLowerCase();
      var year = match.group(2)!.trim();

      if (_monthMap.containsKey(month.substring(0, 3))) {
        month = _monthMap[month.substring(0, 3)]!;
      } else {
        month = month.replaceAll(RegExp(r'\D'), '').padLeft(2, '0');
      }

      final mNum = int.tryParse(month) ?? 0;
      if (mNum < 1 || mNum > 12) return '';

      year = year.replaceAll(RegExp(r'\D'), '');
      if (year.length == 2) {
        year = '20$year';
      }

      final yNum = int.tryParse(year) ?? 2027;
      final lastDay = _daysInMonth(mNum, yNum);
      return '$year-$month-$lastDay';
    }

    return '';
  }

  static int _daysInMonth(int month, int year) {
    if (month == 2) {
      return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) ? 29 : 28;
    }
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month >= 1 && month <= 12) return days[month - 1];
    return 28;
  }
}
