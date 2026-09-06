import 'package:flutter_test/flutter_test.dart';
import 'package:kaziniya_mobile/services/medicine_label_parser.dart';

void main() {
  group('MedicineLabelParser Tests', () {
    test('Correctly extracts standard blister strip packaging', () {
      const sampleBlister = '''
      AUGMENTIN
      Amoxicillin + Clavulanic Acid
      625mg Tablets
      GlaxoSmithKline
      Batch No: B7492A
      MFG: 03/2024
      EXP: 02/2027
      Store below 25°C
      ''';

      final result = MedicineLabelParser.parse(sampleBlister);

      expect(result.name, contains('AUGMENTIN'));
      expect(result.strength, equals('625mg'));
      expect(result.dosageForm, equals('Tablet'));
      expect(result.batchNumber, equals('B7492A'));
      expect(result.expDate, startsWith('2027-02'));
      expect(result.mfgDate, startsWith('2024-03'));
      expect(result.manufacturer, equals('GlaxoSmithKline'));
      expect(result.confidence, greaterThanOrEqualTo(0.8));
    });

    test('Correctly extracts dot-matrix stamped expiry and batch dates', () {
      const dotMatrixBox = '''
      AMOXIL 500mg
      Amoxicillin Capsules
      GlaxoSmithKline
      B . N O . KZ-8902
      E X P . 09.2026
      M F G . 01.2024
      Mfg. Lic. No: 28/UA/2016
      ''';

      final result = MedicineLabelParser.parse(dotMatrixBox);

      expect(result.name, contains('AMOXIL'));
      expect(result.strength, equals('500mg'));
      expect(result.batchNumber, equals('KZ-8902'));
      expect(result.expDate, startsWith('2026-09'));
      expect(result.mfgDate, startsWith('2024-01'));
      // Verify Mfg Lic No is not picked as batch number
      expect(result.batchNumber, isNot(contains('28/UA')));
    });

    test('Correctly extracts crimp edge date without explicit EXP prefix', () {
      const crimpEdge = '''
      CIPROFLOXACIN 500mg
      Bayer AG
      BN: CB-4410
      09/2027
      ''';

      final result = MedicineLabelParser.parse(crimpEdge);

      expect(result.name, contains('CIPROFLOXACIN'));
      expect(result.batchNumber, equals('CB-4410'));
      expect(result.expDate, startsWith('2027-09'));
    });

    test('Multi-frame accumulation merges details across angles', () {
      // Frame 1: Front of box (Camera sees commercial name and strength)
      const frame1Front = '''
      PANADOL EXTRA
      Paracetamol + Caffeine
      500mg / 65mg
      Film-coated Tablets
      GlaxoSmithKline
      ''';

      final frame1Result = MedicineLabelParser.parse(frame1Front);
      expect(frame1Result.nameLocked, isTrue);
      expect(frame1Result.strengthLocked, isTrue);
      expect(frame1Result.dosageFormLocked, isTrue);
      expect(frame1Result.batchLocked, isFalse);
      expect(frame1Result.expDateLocked, isFalse);

      // Frame 2: Side flap / crimp edge (Camera sees stamped batch and expiry)
      const frame2Flap = '''
      B.NO. PEX-9921
      EXP: 11/2027
      MFG: 05/2024
      ''';

      final merged = MedicineLabelParser.accumulateAndParse(frame1Result, frame2Flap);

      // Verify that Front details (Name, Strength, Form) were NOT lost!
      expect(merged.name, contains('PANADOL EXTRA'));
      expect(merged.strength, equals('500mg/65mg'));
      expect(merged.dosageForm, equals('Tablet'));
      expect(merged.manufacturer, equals('GlaxoSmithKline'));

      // Verify that Flap details (Batch, Expiry) were merged successfully!
      expect(merged.batchNumber, equals('PEX-9921'));
      expect(merged.expDate, startsWith('2027-11'));
      expect(merged.mfgDate, startsWith('2024-05'));
      expect(merged.batchLocked, isTrue);
      expect(merged.expDateLocked, isTrue);
      expect(merged.confidence, greaterThanOrEqualTo(0.85));
    });

    test('Fuzzy matches against known pharmacy formulary', () {
      final knownInventory = [
        {
          'id': 'med-101',
          'name': 'Ciprofloxacin 500mg',
          'genericName': 'Ciprofloxacin HCl',
          'brandName': 'Ciprobay',
          'categoryId': 'cat-antibiotics',
        },
      ];

      const ocrScan = '''
      Ciprobay
      Ciprofloxacn 500 mg
      B.No: CP-882
      EXP: 09/2027
      ''';

      final result = MedicineLabelParser.parse(ocrScan, knownProducts: knownInventory);

      expect(result.name, equals('Ciprofloxacin 500mg'));
      expect(result.genericName, equals('Ciprofloxacin HCl'));
      expect(result.suggestedCategory, equals('cat-antibiotics'));
      expect(result.batchNumber, equals('CP-882'));
      expect(result.expDate, startsWith('2027-09'));
    });
  });
}
