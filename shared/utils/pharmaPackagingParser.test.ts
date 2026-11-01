import { describe, expect, it } from "bun:test";
import { parsePackagingText, accumulatePackagingData, ParsedPackagingData } from "./pharmaPackagingParser";

describe("pharmaPackagingParser", () => {
  it("extracts commercial name, generic, strength, batch and standard EXP date", () => {
    const rawOcr = `
      AMOXIL
      Amoxicillin Capsules BP 500mg
      GlaxoSmithKline
      Batch No: B7492A
      MFG: 03/2024
      EXP: 02/2027
    `;
    const res = parsePackagingText(rawOcr);
    expect(res.name.toUpperCase()).toContain("AMOXIL");
    expect(res.genericName.toLowerCase()).toContain("amoxicillin");
    expect(res.strength).toBe("500mg");
    expect(res.dosageForm).toBe("Capsule");
    expect(res.batchNumber).toBe("B7492A");
    expect(res.expDate).toBe("2027-02-28");
    expect(res.manufacturer).toContain("GlaxoSmithKline");
    expect(res.nameLocked).toBe(true);
    expect(res.strengthLocked).toBe(true);
    expect(res.batchLocked).toBe(true);
    expect(res.expDateLocked).toBe(true);
  });

  it("handles dot-matrix stamped expiry dates (EXP 09 26)", () => {
    const rawOcr = `
      CIPROBAY
      Ciprofloxacin 500mg
      Bayer AG
      BN: CB9910
      EXP 09 26
    `;
    const res = parsePackagingText(rawOcr);
    expect(res.name.toUpperCase()).toContain("CIPROBAY");
    expect(res.batchNumber).toBe("CB9910");
    expect(res.expDate).toBe("2026-09-30");
    expect(res.expDateLocked).toBe(true);
  });

  it("handles foil crimp edge embossed date without keyword (09/2027)", () => {
    const rawOcr = `
      AUGMENTIN 625mg
      Amoxicillin and Clavulanate Potassium Tablets
      09/2027
      LOT: AG-7712
    `;
    const res = parsePackagingText(rawOcr);
    expect(res.name.toUpperCase()).toContain("AUGMENTIN");
    expect(res.expDate).toBe("2027-09-30");
    expect(res.batchNumber).toBe("AG-7712");
  });

  it("does not mistake Mfg. Lic. No. for a batch number", () => {
    const rawOcr = `
      Panadol Extra
      Paracetamol 500mg, Caffeine 65mg
      Mfg. Lic. No. G/28/1429
      Batch: B-9988
      EXP: 12/2028
    `;
    const res = parsePackagingText(rawOcr);
    expect(res.batchNumber).toBe("B-9988");
    expect(res.batchNumber).not.toContain("G/28/1429");
  });

  it("accumulates multi-frame data when rotating medicine package", () => {
    // Frame 1: Front face showing Brand, Generic, Strength & Manufacturer
    const frame1 = `
      GLUCOPHAGE
      Metformin Hydrochloride 850mg
      Merck Santé s.a.s.
      Film-coated tablets
    `;
    const step1 = parsePackagingText(frame1);
    expect(step1.name.toUpperCase()).toContain("GLUCOPHAGE");
    expect(step1.strength).toBe("850mg");
    expect(step1.dosageForm).toBe("Tablet");
    expect(step1.batchLocked).toBe(false);
    expect(step1.expDateLocked).toBe(false);

    // Frame 2: Side flap / crimp edge showing Batch and Expiry stamped with dot-matrix
    const frame2 = `
      B.No: M850-99
      EXP 11 27
      MFG 12 24
    `;
    const step2 = accumulatePackagingData(step1, frame2);

    // Step 2 should retain Frame 1's Name, Strength, Form, and merge Frame 2's Batch & Expiry
    expect(step2.name.toUpperCase()).toContain("GLUCOPHAGE");
    expect(step2.strength).toBe("850mg");
    expect(step2.dosageForm).toBe("Tablet");
    expect(step2.batchNumber).toBe("M850-99");
    expect(step2.expDate).toBe("2027-11-30");
    expect(step2.nameLocked).toBe(true);
    expect(step2.strengthLocked).toBe(true);
    expect(step2.batchLocked).toBe(true);
    expect(step2.expDateLocked).toBe(true);
  });
});
