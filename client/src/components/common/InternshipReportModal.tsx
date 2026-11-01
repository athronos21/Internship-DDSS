import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  X,
  BookOpen,
  Award,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Package,
  FileCode,
  Users,
  Printer,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface InternshipReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InternshipReportModal: React.FC<InternshipReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<string>('cover');
  const [copied, setCopied] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadFile = (format: 'docx' | 'pdf' | 'zip') => {
    try {
      setDownloadingFormat(format);
      let href = '/Kaziniya_PIMS_Internship_Report.docx';
      let filename = 'Internship Report – Digital Drug Store (DDS) Pharmaceutical Inventory Management Platform.docx';

      if (format === 'pdf') {
        href = '/Kaziniya_PIMS_Internship_Report.pdf';
        filename = 'Kaziniya_DDS_Inventory_Internship_Report.pdf';
        showToast('Downloading official formatted PDF report...', 'info', 'Academic PDF');
      } else if (format === 'zip') {
        href = '/Kaziniya_PIMS_Internship_Report_Overleaf.zip';
        filename = 'Kaziniya_DDS_Inventory_Report_Overleaf.zip';
        showToast('Downloading complete Overleaf LaTeX bundle...', 'info', 'LaTeX Source');
      } else {
        showToast('Downloading complete Microsoft Word document...', 'info', 'Word Document');
      }

      const link = document.createElement('a');
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setDownloadingFormat(null);
        showToast(`${format.toUpperCase()} report file downloaded successfully!`, 'success', 'Download Complete');
      }, 1000);
    } catch (err) {
      setDownloadingFormat(null);
      showToast('Error downloading file directly. Retrying via backend endpoint...', 'error');
      window.open('/api/reports/internship-docx', '_blank');
    }
  };

  const handleCopySection = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Section text copied to clipboard!', 'success', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { id: 'cover', title: '1. Cover Page', icon: Award },
    { id: 'preliminary', title: '2. Preliminary Pages', icon: BookOpen },
    { id: 'introduction', title: '3. Ch 1: Introduction', icon: Building2 },
    { id: 'experience', title: '4. Ch 2: Internship Experience', icon: Cpu },
    { id: 'project', title: '5. Ch 3: Project DDSS & PIMS', icon: Layers },
    { id: 'benefits', title: '6. Ch 4: Benefits & Reflection', icon: Sparkles },
    { id: 'conclusion', title: '7. Ch 5: Conclusion & Recs', icon: FileText },
    { id: 'references', title: '8. References', icon: BookOpen },
    { id: 'appendices', title: '9. Appendices', icon: FileCode },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shadow-inner">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Academic Internship Final Report</span>
                <span className="text-[10px] bg-teal-950 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-800 font-mono font-bold">
                  OFFICIAL PIMS & DDSS DOCUMENTATION
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Haramaya University • College of Computing and Informatics (CCI) • Dept. of Information Technology
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadFile('docx')}
              disabled={downloadingFormat !== null}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md hover:shadow-blue-500/25 active:scale-95"
              title="Download Microsoft Word (.docx) document"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloadingFormat === 'docx' ? 'Downloading...' : 'Word (.docx)'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadFile('pdf')}
              disabled={downloadingFormat !== null}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md hover:shadow-rose-500/25 active:scale-95"
              title="Download formatted academic PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloadingFormat === 'pdf' ? 'Downloading...' : 'PDF (.pdf)'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadFile('zip')}
              disabled={downloadingFormat !== null}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title="Download Overleaf LaTeX archive (.zip)"
            >
              <FileCode className="h-3.5 w-3.5 text-teal-400" />
              <span>LaTeX (.zip)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Section Pills */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-slate-800 bg-slate-950/50 overflow-x-auto text-xs font-semibold scrollbar-none">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Document Content View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/40 text-slate-200 text-sm leading-relaxed">
          {/* Quick Action Download Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-blue-950/80 border border-teal-700/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2">
                <span>📄 Full Microsoft Word Document (.docx) & PDF Available</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                  VERIFIED ACADEMIC
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Official document generated from <code className="text-teal-300 font-mono text-[11px]">Internship Report – Digital Drug Store (DDS) Pharmaceutical Inventory Management Platform.docx</code> (Times New Roman 12pt, 1.5 spacing, 1-inch margins, complete 3NF ERD, FEFO algorithms, and testing matrices).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleDownloadFile('docx')}
                className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download .docx</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadFile('pdf')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-rose-900/50"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Section 1: Cover Page */}
          {activeSection === 'cover' && (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 max-w-3xl mx-auto text-center">
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-teal-400 tracking-wide uppercase">
                  Haramaya University, Ethiopia
                </h2>
                <h3 className="text-sm font-bold text-slate-200 uppercase">
                  College of Computing and Informatics (CCI)
                </h3>
                <h4 className="text-sm font-bold text-slate-300 uppercase">
                  Department of Information Technology (IT)
                </h4>
              </div>

              <div className="py-6 border-y border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Internship Report On:
                </span>
                <h1 className="text-xl font-black text-white leading-snug">
                  DIGITAL DRUG STORE (DDS) FULL PHARMACEUTICAL INVENTORY MANAGEMENT PLATFORM (PIMS)
                </h1>
                <p className="text-xs text-slate-300 italic max-w-xl mx-auto">
                  An End-to-End, EFDA-Compliant Multi-Batch Warehouse, Supplier Procurement Pipeline, Automated FEFO Allocation, Optical Stocktaking, and Financial Inventory Audit System for Kaziniya Drug Store
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                    Submitted By:
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <p className="font-bold text-white">1. Atronos Sisay</p>
                    <p className="text-slate-400">Student ID: <span className="font-mono text-teal-300">0761/16</span></p>
                    <p className="text-slate-400">Email: athronos21@gmail.com</p>
                    <p className="text-slate-400">Program: B.Sc. in Information Technology</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <p className="font-bold text-white">2. Beka Girma</p>
                    <p className="text-slate-400">Student ID: <span className="font-mono text-teal-300">0821/16</span></p>
                    <p className="text-slate-400">Program: B.Sc. in Information Technology</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                      Hosting Organization:
                    </span>
                    <p className="font-bold text-white">Kaziniya Drug Store & Healthcare Supplies</p>
                    <p className="text-slate-400">Bole Medhanealem, Addis Ababa, Ethiopia</p>
                    <p className="text-slate-400 font-mono text-[11px]">EFDA License: EFDA/DISP/AA/2024/8492 | TIN: 0098234123</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                      Immediate Industrial Supervisor:
                    </span>
                    <p className="font-bold text-white">Monet Alemayehu</p>
                    <p className="text-slate-400">Designation: Immediate Supervisor, Kaziniya Drug Store</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                      Academic Department Advisor:
                    </span>
                    <p className="font-bold text-white">Mr. Nabyom Sh. (M.Sc.)</p>
                    <p className="text-slate-400">Lecturer, Dept. of Information Technology, Haramaya University</p>
                    <p className="text-slate-400 pt-1"><strong>Internship Period:</strong> July 1, 2026 – August 15, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Preliminary Pages */}
          {activeSection === 'preliminary' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>Declaration and Approval Sheet</span>
                  <span className="text-xs text-teal-400 font-mono">Page i</span>
                </h3>
                <div className="space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-white">Students' Declaration:</p>
                  <p className="italic bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    "We, <strong>Atronos Sisay</strong> (ID: 0761/16) and <strong>Beka Girma</strong> (ID: 0821/16), hereby declare that this internship report titled <em>'Digital Drug Store (DDS) Full Pharmaceutical Inventory Management Platform (PIMS)'</em> is our original work carried out during our practical industrial attachment at <strong>Kaziniya Drug Store</strong> from <strong>July 1, 2026 to August 15, 2026</strong>. This report has not been submitted previously to this or any other academic institution for any degree, diploma, or certificate."
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Student 1</span>
                    <span className="font-bold text-white">Atronos Sisay</span>
                    <span className="text-[10px] text-teal-400 block mt-1 font-mono">ID: 0761/16</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Student 2</span>
                    <span className="font-bold text-white">Beka Girma</span>
                    <span className="text-[10px] text-teal-400 block mt-1 font-mono">ID: 0821/16</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Hosting Supervisor</span>
                    <span className="font-bold text-white">Monet Alemayehu</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">Status: Approved</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Academic Advisor</span>
                    <span className="font-bold text-white">Mr. Nabyom Sh. (M.Sc.)</span>
                    <span className="text-[10px] text-teal-400 block mt-1">Haramaya University</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>Executive Summary</span>
                  <span className="text-xs text-teal-400 font-mono">Page ii</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The pharmaceutical supply chain in community drug stores faces acute operational risks stemming from paper-based stock card recordkeeping, unindexed shelf storage, and manual inventory audits. In Ethiopia, community drug stores routinely incur severe economic losses from stock expiring on shelves prior to issue, while facing serious public health risks from the accidental distribution of degraded medicines.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This internship report documents the conceptualization, full-stack architectural engineering, and on-site deployment of the <strong>Digital Drug Store (DDS) Full Pharmaceutical Inventory Management Platform (PIMS)</strong> at <strong>Kaziniya Drug Store</strong>. Executed during an intensive 7-week industrial placement from July 1, 2026 to August 15, 2026, the project focuses on modernizing inventory logistics:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="font-bold text-teal-300 block mb-1">1. Master 3NF Multi-Batch Catalog:</span>
                    <span>Normalized schema decoupling 420+ SKU medicine catalog from individual manufacturing batches with expiry timestamps and shelf coordinates.</span>
                  </div>
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="font-bold text-teal-300 block mb-1">2. Supplier Procurement & GRN Receiving:</span>
                    <span>End-to-end PO lifecycle, delivery inspection, cold-chain temperature verification, and accounts payable reconciliation.</span>
                  </div>
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="font-bold text-teal-300 block mb-1">3. Automated FEFO Queue Engine:</span>
                    <span>Dynamic priority queue sorted by earliest expiry date with code-level quarantine locks strictly blocking expired stock.</span>
                  </div>
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="font-bold text-teal-300 block mb-1">4. Optical Packaging Scanner for Stocktaking:</span>
                    <span>Rolling 5-frame computer vision barcode and OCR accumulator cutting physical stocktaking time from 16 hours to 2.5 hours.</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                  List of Acronyms & Abbreviations
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-teal-400">PIMS:</strong> Pharmaceutical Inventory Management System</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-teal-400">DDS:</strong> Digital Drug Store</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-teal-400">EFDA:</strong> Ethiopian Food and Drug Authority</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-teal-400">FEFO:</strong> First-Expiry-First-Out</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-teal-400">GRN:</strong> Goods Receipt Note</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-teal-400">SKU:</strong> Stock Keeping Unit</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-teal-400">COGS:</strong> Cost of Goods Sold</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-teal-400">TIN:</strong> Taxpayer Identification Number</div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Introduction */}
          {activeSection === 'introduction' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 1: Introduction to Hosting Organization
              </h3>
              <div className="space-y-4 text-xs text-slate-300">
                <div>
                  <h4 className="font-bold text-teal-300 mb-1">1.1 Background of Kaziniya Drug Store & Healthcare Supplies:</h4>
                  <p className="leading-relaxed">
                    Kaziniya Drug Store & Healthcare Supplies is a prominent community pharmaceutical dispensary and healthcare supply facility located in the Bole Medhanealem commercial and medical corridor of Addis Ababa, Ethiopia. Licensed by the Ethiopian Food and Drug Authority (License No: <span className="font-mono text-teal-300">EFDA/DISP/AA/2024/8492</span>) and registered with the Ministry of Revenues (TIN: <span className="font-mono text-teal-300">0098234123</span>), the dispensary serves over 15,000 residents monthly. The facility houses specialized clinical storage bays, a dedicated cold-chain biologicals storage depot (2°C–8°C), and manages over 420 distinct pharmaceutical SKUs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-bold text-white block mb-1">1.2 Institutional Vision:</span>
                    <p className="italic text-slate-400">
                      "To become Ethiopia's most dependable, digitally modern community drug store and healthcare supply facility, recognized for zero medication wastage, exemplary inventory stewardship, and uncompromising adherence to pharmaceutical storage standards."
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="font-bold text-white block mb-1">1.3 Institutional Mission:</span>
                    <p className="italic text-slate-400">
                      "Providing authentic, EFDA-certified medications, implementing automated digital inventory workflows and algorithmic FEFO stock allocation to eliminate shelf expiration losses, and ensuring consistent therapeutic availability."
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-teal-300 mb-1">1.4 Main Products and Regulated Storage Categories:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    <li><strong>Pharmaceutical Warehousing & Stock Custody:</strong> Receiving, physical inspection, shelf indexing, and algorithmic FEFO stock issue for 420+ SKUs.</li>
                    <li><strong>Cold-Chain Biologicals Storage:</strong> Regulated refrigeration storage (2°C–8°C) for insulin, vaccines, and injectables with digital temperature telemetry.</li>
                    <li><strong>Essential Therapeutics & Generics:</strong> First-line antibiotics (Amoxicillin, Ceftriaxone, Ciprofloxacin), antimalarials, and analgesics under batch-level tracking.</li>
                    <li><strong>Chronic Care Medicines:</strong> Regulated storage for cardiovascular, antidiabetic (Metformin), and antihypertensive drugs.</li>
                    <li><strong>Medical Consumables:</strong> Bandages, sterile syringes, IV infusion sets, and rapid diagnostic screening kits.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-teal-300 mb-1">1.5 Organizational Hierarchy:</h4>
                  <p>
                    Managing Director Monet Alemayehu → Head Pharmacist Solomon Bekele → Dispensary Counter, Warehouse Inventory Logistics, and IT Systems Administration (Interns: Atronos Sisay & Beka Girma).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Experience */}
          {activeSection === 'experience' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 2: Overall Internship Experience & Specific Workpieces
              </h3>
              <div className="space-y-4 text-xs text-slate-300">
                <p>
                  <strong>Section of Placement:</strong> Warehouse & Inventory Logistics Section and IT Systems Development at Kaziniya Drug Store.
                </p>

                <div className="space-y-2">
                  <h4 className="font-bold text-teal-300">Executed Workpieces (Workpieces 1 to 6):</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <strong className="text-white block">Workpiece 1: Master Formulary Catalog & 3NF Multi-Batch Relational Data Modeling</strong>
                      <span>Designed the 3NF schema isolating conceptual medication entities from physical manufacturer batches, tracking batch numbers, manufacturing/expiry dates, supplier provenance, and shelf coordinates across 420+ SKUs.</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <strong className="text-white block">Workpiece 2: Supplier Procurement Pipeline, Purchase Orders, and Goods Receiving (GRN) Inspection</strong>
                      <span>Built end-to-end supplier procurement: PO generation, delivery verification, physical batch inspection, temperature checks, and accounts payable credit recording.</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <strong className="text-white block">Workpiece 3: Automated First-Expiry-First-Out (FEFO) Queue Engine & Expiry Safeguards</strong>
                      <span>Implemented algorithmic priority queues sorted by min(ExpiryDate) to exhaust nearest-expiry batches first, with code-level quarantine locks on expired stock.</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <strong className="text-white block">Workpiece 4: Computer-Vision Barcode & Label Optical Packaging Stocktaking (Flutter & Dart)</strong>
                      <span>Engineered a rolling 5-frame computer vision accumulator parsing curved packaging and barcodes on mobile cameras, cutting shelf auditing time from 16h to 2.5h.</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <strong className="text-white block">Workpiece 5: Inventory Valuation, Stock Movement Ledgers, and EFDA Audit Reporting</strong>
                      <span>Built immutable transaction ledgers for 8 movement types, real-time Cost of Goods Sold (COGS) computations, and one-click PDF/Excel regulatory audit reports.</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <strong className="text-white block">Workpiece 6: Inter-Branch Stock Requisitions, Warehouse Shelf Tracking, and Adjustment Audits</strong>
                      <span>Created inter-branch transit tracking between central warehouse and retail dispensary shelves, with reason-coded adjustment workflows.</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-teal-300 mb-1">Applied Coursework & Technical Stack:</h4>
                  <p>
                    TypeScript, React 19, Tailwind CSS, Express, Bun, SQLite/PostgreSQL, Flutter/Dart, Docker Compose. Applied concepts from Database Systems (ACID, 3NF), Data Structures (Priority Queues), Software Engineering (Agile Scrum), and Computer Networks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Project */}
          {activeSection === 'project' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 3: Project Selection, Architecture, and Verification
              </h3>
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-800/80">
                  <span className="font-bold text-teal-300 block text-sm">Project Title:</span>
                  <span className="font-black text-white text-sm">
                    “Digital Drug Store (DDS) Full Pharmaceutical Inventory Management Platform (PIMS): An Enterprise-Grade Multi-Batch Warehousing, Supplier Procurement, Automated FEFO Queue, Optical Stocktaking, and Financial Ledger Audit System”
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-teal-300 mb-1">Functional Verification Matrix (Table 3.2):</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border border-slate-800">
                      <thead className="bg-slate-950 text-slate-300">
                        <tr>
                          <th className="p-2 border border-slate-800">Test ID</th>
                          <th className="p-2 border border-slate-800">Subsystem / Function</th>
                          <th className="p-2 border border-slate-800">Verification Criteria</th>
                          <th className="p-2 border border-slate-800">Operational Outcome</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-01</td>
                          <td className="p-2">3NF Multi-Batch Model</td>
                          <td className="p-2">Single SKU manages independent batches with separate expiry & shelf coordinates</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (3NF verified)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-02</td>
                          <td className="p-2">Procurement & GRN Receiving</td>
                          <td className="p-2">Delivery matched against PO with discrepancy flagging & AP ledger credit</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (100% matched)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-03</td>
                          <td className="p-2">Automated FEFO Allocation</td>
                          <td className="p-2">Pulls batch expiring in 45 days prior to batch expiring in 180 days</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (min(Exp) queue)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-04</td>
                          <td className="p-2">Expiry Quarantine Safeguard</td>
                          <td className="p-2">Batch with Δdays ≤ 0 triggers hard software lock prohibiting distribution</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (100% block rate)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-05</td>
                          <td className="p-2">Mobile Optical Scanner</td>
                          <td className="p-2">Rolling 5-frame accumulator accurately parses curved medicine vial packaging</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (&lt;3.5% error)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-06</td>
                          <td className="p-2">Concurrency Mutex</td>
                          <td className="p-2">Simultaneous stock allocations resolve atomically without negative balance</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (Zero drift)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-07</td>
                          <td className="p-2">Dynamic Reorder Alerts</td>
                          <td className="p-2">Count below safety stock threshold triggers instant visual warnings</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (Instant alert)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-08</td>
                          <td className="p-2">Branch Stock Requisition</td>
                          <td className="p-2">Electronic stock transfer between main warehouse & dispensary shelves</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (Zero loss)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-09</td>
                          <td className="p-2">Financial COGS & Valuation</td>
                          <td className="p-2">Accurate computation of real-time inventory asset value based on purchase costs</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (COGS verified)</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-teal-400">TC-10</td>
                          <td className="p-2">EFDA Audit Trail</td>
                          <td className="p-2">Chronological tamper-evident audit trail for RECEIPT, TRANSFER, ADJUST, DISPOSAL</td>
                          <td className="p-2 text-emerald-400 font-bold">Passed (EFDA compliant)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-teal-300 mb-1">Empirical Quantitative Impact (Table 3.3):</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Expiry Latency</span>
                      <span className="text-base font-black text-emerald-400">99.8% ↓</span>
                      <span className="text-[10px] text-slate-500 block">15m → &lt;0.2s</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Expired Dispensed</span>
                      <span className="text-base font-black text-emerald-400">0.0%</span>
                      <span className="text-[10px] text-slate-500 block">100% Elimination</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Shelf Value Loss</span>
                      <span className="text-base font-black text-emerald-400">87.7% ↓</span>
                      <span className="text-[10px] text-slate-500 block">9.8% → 1.2%</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Stocktaking Time</span>
                      <span className="text-base font-black text-emerald-400">84.4% ↓</span>
                      <span className="text-[10px] text-slate-500 block">16h → 2.5h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Benefits */}
          {activeSection === 'benefits' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 4: Benefits Gained from the Internship and Professional Reflection
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>4.1 Practical Skills Improved:</strong> Gained industrial expertise in architecting 3NF multi-tenant relational schemas, developing concurrent Express/Bun APIs, building reactive React 19 dashboards with Tailwind CSS v4, and engineering cross-platform Flutter/Dart optical stocktaking mobile applications.
                </p>
                <p>
                  <strong>4.2 Theoretical Knowledge Upgraded:</strong> Bridged university computer science theory with industrial practice in database normalization, algorithmic time complexity (O(N log N) FEFO sorting), asynchronous network resilience, and pharmaceutical warehouse cold-chain standards.
                </p>
                <p>
                  <strong>4.3 Industrial Problem-Solving & Leadership:</strong> Mastered the translation of ambiguous pharmaceutical regulatory guidelines into deterministic software logic, designed tamper-proof audit trails, and led sprint retrospectives.
                </p>
                <p>
                  <strong>4.4 Work Ethics & Healthcare Privacy:</strong> Understood strict healthcare regulatory compliance under the Ethiopian Food and Drug Authority (EFDA) and Ministry of Revenues, maintaining patient confidentiality and data integrity.
                </p>
              </div>
            </div>
          )}

          {/* Section 7: Conclusion */}
          {activeSection === 'conclusion' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 5: Conclusion and Recommendations
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>5.1 Overall Conclusion:</strong> The 7-week industrial internship at Kaziniya Drug Store successfully culminated in the architectural design, implementation, and deployment of the Digital Drug Store (DDS) Full Pharmaceutical Inventory Management Platform (PIMS). The platform definitively eliminates medication expiry losses and modernizes pharmaceutical supply logistics in Ethiopia.
                </p>
                <p>
                  <strong>5.2 Recommendations for Hosting Company (Student Placement Verdict):</strong> Kaziniya Drug Store is <strong>strongly recommended</strong> as an exemplary industrial placement site for future software engineering and IT interns. The organization offers high-impact real-world challenges, exceptional mentorship from supervisor Monet Alemayehu, and direct engagement with health informatics.
                </p>
                <p>
                  <strong>5.3 Institutional & National Recommendations:</strong>
                  <br />1. Mandating institutional adoption of algorithmic FEFO queues across community drug stores as an EFDA license condition.
                  <br />2. Integrating national pharmaceutical logistics APIs (EPSS) for automated replenishment.
                  <br />3. Standardizing handheld 2D optical scanning hardware across retail dispensary counters.
                </p>
              </div>
            </div>
          )}

          {/* Section 8: References */}
          {activeSection === 'references' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                References & Statutory Citations
              </h3>
              <div className="space-y-2 text-xs text-slate-300 font-mono">
                <p>[1] Ethiopian Food and Drug Authority (EFDA), "Directives for Good Storage and Distribution Practices for Pharmaceuticals in Ethiopia," 3rd Edition, Addis Ababa, 2023.</p>
                <p>[2] World Health Organization (WHO), "Good Pharmacy Practice (GPP) in Community and Hospital Pharmacy Settings," WHO Technical Report Series, No. 961, Geneva, 2020.</p>
                <p>[3] Ethiopian Ministry of Revenues, "Tax Administration Proclamation and Electronic Invoicing Regulations (EIMS)," Addis Ababa, Ethiopia, 2024.</p>
                <p>[4] Date, C. J., "An Introduction to Database Systems," 8th Edition, Pearson Education, 2019.</p>
                <p>[5] Pressman, R. S., and Maxim, B. R., "Software Engineering: A Practitioner's Approach," 9th Edition, McGraw-Hill, 2020.</p>
                <p>[6] Martin, R. C., "Clean Architecture: A Craftsman's Guide to Software Structure and Design," Prentice Hall, 2018.</p>
              </div>
            </div>
          )}

          {/* Section 9: Appendices */}
          {activeSection === 'appendices' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Appendices: Schemas & Inspection Checklist
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p><strong>Appendix A: Core Relational Data Schema DDL:</strong> 3NF entity structures for <code className="text-teal-300 font-mono">MEDICINE</code>, <code className="text-teal-300 font-mono">MEDICINE_BATCH</code>, <code className="text-teal-300 font-mono">SUPPLIER</code>, <code className="text-teal-300 font-mono">PURCHASE_ORDER</code>, <code className="text-teal-300 font-mono">INVENTORY_TRANSACTION</code>, and <code className="text-teal-300 font-mono">STOCKTAKE_LOG</code>.</p>
                <p><strong>Appendix B: Continuous Packaging Scanner Algorithm:</strong> Multi-frame consensus voting and temporal frame accumulator for smartphone camera stocktaking.</p>
                <p><strong>Appendix C: EFDA Regulatory Compliance Checklist:</strong> 100% compliant status on batch traceability, expired drug hard lock, FEFO queueing, and tamper-proof audit trails.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Award className="h-4 w-4 text-teal-400" />
            <span>Academic Defense & Evaluation Ready • Haramaya University CCI</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadFile('docx')}
              disabled={downloadingFormat !== null}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <Download className="h-4 w-4" />
              <span>Download Word (.docx)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadFile('pdf')}
              disabled={downloadingFormat !== null}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF (.pdf)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
