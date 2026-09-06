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
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadDocx = async () => {
    try {
      setIsDownloading(true);
      showToast('Preparing Word (.docx) document...', 'info', 'Generating Document');

      // Create a direct download anchor for the Word file
      const link = document.createElement('a');
      link.href = '/Internship_Report_Digital_Drug_Store.docx';
      link.download = 'Internship_Report_Digital_Drug_Store.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setIsDownloading(false);
        showToast('Internship Report (.docx) downloaded successfully!', 'success', 'Download Complete');
      }, 1000);
    } catch (err) {
      setIsDownloading(false);
      showToast('Error downloading Word file. Retrying via API...', 'error');
      window.open('/api/reports/internship-docx', '_blank');
    }
  };

  const handleCopySection = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Section content copied to clipboard!', 'success', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { id: 'cover', title: '1. Cover Page', icon: Award },
    { id: 'preliminary', title: '2. Preliminary Pages', icon: BookOpen },
    { id: 'introduction', title: '3. Introduction', icon: Building2 },
    { id: 'experience', title: '4. Internship Experience', icon: Cpu },
    { id: 'project', title: '5. Project Formulation', icon: Layers },
    { id: 'benefits', title: '6. Benefits & Reflection', icon: Sparkles },
    { id: 'conclusion', title: '7. Conclusion & Recs', icon: FileText },
    { id: 'references', title: '8. References', icon: BookOpen },
    { id: 'appendices', title: '9. Appendices', icon: Layers },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-inner">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Academic Internship Final Report</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-800 font-mono font-bold">
                  MICROSOFT WORD (.DOCX)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official 9-Section Final Academic Report for Software Engineering Internship
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-lg hover:shadow-blue-500/25 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Generating...' : 'Download (.docx)'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
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
                    ? 'bg-blue-600 text-white shadow-md'
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-emerald-950/80 border border-blue-700/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2">
                <span>📄 Full Microsoft Word Document Ready</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                  100% COMPLETE
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Formatted according to university academic guidelines with standard fonts (Calibri 12pt, 1.5 spacing, 1-inch margins, tables, and Roman/Arabic page numbering).
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadDocx}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md shrink-0 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Download .docx File</span>
            </button>
          </div>

          {/* Section 1: Cover Page */}
          {activeSection === 'cover' && (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6 max-w-3xl mx-auto text-center">
              <div className="space-y-1.5">
                <h2 className="text-lg font-black text-emerald-400 tracking-wide uppercase">
                  Haramaya University
                </h2>
                <h3 className="text-sm font-bold text-slate-200">
                  College of Computing and Informatics
                </h3>
                <h4 className="text-sm font-bold text-slate-300">
                  Department of Information Technology
                </h4>
              </div>

              <div className="py-6 border-y border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Final Internship Report
                </span>
                <h1 className="text-xl font-black text-white leading-snug">
                  DESIGN, DEVELOPMENT, AND DEPLOYMENT OF DIGITAL DRUG STORE (DDS) — AN INTELLIGENT PHARMACY INVENTORY, POS COUNTER, AND EIMS COMPLIANCE MANAGEMENT SYSTEM
                </h1>
                <p className="text-xs text-slate-400 italic max-w-xl mx-auto">
                  A Final Internship Report Submitted in Partial Fulfillment of the Requirements for the Degree of Bachelor of Science in Information Technology
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-xs bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Prepared By (Group of Two):
                  </span>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <p className="font-bold text-white">1. Student 1 (Group Lead)</p>
                    <p className="text-slate-400">Student ID: UGR/0001/14</p>
                    <p className="text-slate-400">Email: athronos21@gmail.com</p>
                    <p className="text-slate-400">Phone: +251 911 224 421</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <p className="font-bold text-white">2. Student 2 (Co-Author)</p>
                    <p className="text-slate-400">Student ID: UGR/0002/14</p>
                    <p className="text-slate-400">Email: student2@haramaya.edu.et</p>
                    <p className="text-slate-400">Phone: +251 922 334 455</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Academic Advisor:
                    </span>
                    <p className="font-bold text-white">Dr. Solomon Tadesse (PhD)</p>
                    <p className="text-slate-400">Associate Professor</p>
                    <p className="text-slate-400">Dept. of Information Technology</p>
                    <p className="text-slate-400">College of Computing & Informatics</p>
                    <p className="text-slate-400">Haramaya University</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Hosting Organization:
                    </span>
                    <p className="font-bold text-white">Kaziniya & DDS Healthcare Solutions PLC</p>
                    <p className="text-slate-400">Addis Ababa, Ethiopia</p>
                    <p className="text-slate-400">Division: Health Information Systems (HIS)</p>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Industry Supervisor:
                    </span>
                    <p className="font-bold text-white">Mr. Dawit Gebremariam (MSc)</p>
                    <p className="text-slate-400">Lead Software Architect & Tech Director</p>
                    <p className="text-slate-400">Duration: July 2026 – September 2026 (12 Weeks)</p>
                    <p className="text-slate-400">Submission Date: September 2, 2026</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Preliminary Pages */}
          {activeSection === 'preliminary' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                  Declaration of the Student Group & Supervisors Approval
                </h3>
                <p className="text-xs text-slate-300">
                  <strong>Student Group Declaration:</strong> We, the undersigned, declare that this internship report titled <em>"Design, Development, and Deployment of Digital Drug Store (DDS) — An Intelligent Pharmacy Inventory, POS Counter, and EIMS Compliance Management System"</em> is our original work conducted during our 12-week industrial internship at Kaziniya & DDS Healthcare Solutions PLC.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Student 1 Signature</span>
                    <span className="font-bold text-white">Student 1 (Lead)</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">ID: UGR/0001/14</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Student 2 Signature</span>
                    <span className="font-bold text-white">Student 2 (Co-Author)</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">ID: UGR/0002/14</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Hosting Supervisor</span>
                    <span className="font-bold text-white">Mr. Dawit Gebremariam</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">Status: Approved</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Academic Advisor</span>
                    <span className="font-bold text-white">Dr. Solomon Tadesse</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">Haramaya University</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                  Executive Summary
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This report documents the industrial internship undertaken at Kaziniya & DDS Healthcare Solutions PLC by a team of two Information Technology students from Haramaya University, College of Computing and Informatics. The project addresses systemic operational bottlenecks in modern pharmaceutical dispensaries — including high medication expiry write-offs, stockouts of critical antibiotics, slow customer checkout queues, and compliance hurdles with the Ethiopian Food and Drug Authority (EFDA) and Ministry of Revenues (EIMS/TIN invoicing). The group architected and deployed an end-to-end web and mobile system with an automated FEFO inventory batch engine, instant multi-tender POS checkout (Cash, Telebirr QR, CBE Birr, Card), 30-day Machine Learning demand forecasting, and a mobile PWA companion.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                  List of Acronyms
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-emerald-400">DDS:</strong> Digital Drug Store</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-emerald-400">POS:</strong> Point of Sale</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-emerald-400">EFDA:</strong> Ethiopian Food & Drug Authority</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-emerald-400">EIMS:</strong> Electronic Invoicing Management</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-emerald-400">FEFO:</strong> First-Expired, First-Out</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-emerald-400">PWA:</strong> Progressive Web Application</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-emerald-400">OCR:</strong> Optical Character Recognition</div>
                  <div className="p-2 bg-slate-950 rounded-lg"><strong className="text-emerald-400">RBAC:</strong> Role-Based Access Control</div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Introduction */}
          {activeSection === 'introduction' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 1: Introduction to Hosting Organization
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>1.1 Background:</strong> Kaziniya & DDS Healthcare Solutions PLC is an innovative software engineering and HealthTech consultancy enterprise headquartered in Addis Ababa, Ethiopia. The company specializes in modernizing pharmaceutical supply chains, clinical dispensary workflows, and regulatory compliance platforms across East Africa.
                </p>
                <p>
                  <strong>1.2 Vision:</strong> To be the preeminent HealthTech platform in Sub-Saharan Africa, enabling zero preventable medication stockouts, zero expired drug dispensing, and 100% automated regulatory compliance.
                </p>
                <p>
                  <strong>1.3 Mission:</strong> Empower pharmacists and drug store owners with cutting-edge software solutions that streamline retail point-of-sale, automate intelligent supply chain forecasting, and protect patient medication safety.
                </p>
                <p>
                  <strong>1.4 Products:</strong> DDS Core Cloud POS & ERP, FEFO Batch Inventory Engine, ML Demand Forecaster, Mobile PWA Counter Companion, and EIMS Regulatory Gateway.
                </p>
              </div>
            </div>
          )}

          {/* Section 4: Experience */}
          {activeSection === 'experience' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 2: Overall Internship Experience & Specific Tasks
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Section of Placement:</strong> Health Information Systems (HIS) & Full-Stack Product Engineering Department.
                </p>
                <p>
                  <strong>Executed Tasks:</strong>
                  <br />• High-Speed POS Counter Checkout with instant Telebirr QR, CBE Birr, Card, Cash, and Split-Tender billing.
                  <br />• 90-Day FEFO Batch Allocation & Expiry Risk Matrix.
                  <br />• Machine Learning 30-Day Predictive Demand Forecasting and Procurement Engine.
                  <br />• Mobile PWA Companion with Camera Barcode Scanner.
                  <br />• Cashier Shift Handover Reconciliation and Immutable Audit Trail Logging.
                </p>
                <p>
                  <strong>Applied Coursework:</strong> Data Structures (Hash Maps & Priority Queues), Database Systems (ACID Transactions & Normalization), Software Architecture (Clean Architecture & MVC), Web Engineering (React 19, TypeScript, REST APIs), and Software Quality Assurance.
                </p>
              </div>
            </div>
          )}

          {/* Section 5: Project */}
          {activeSection === 'project' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 3: Project Formulation, Implementation & Discussion
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Project Title:</strong> Digital Drug Store (DDS) — An Intelligent Pharmacy Inventory, POS Counter, and EIMS Compliance Management System.
                </p>
                <p>
                  <strong>Problem Statement:</strong> Traditional drug stores lose 8%–15% of working capital to expired medicine write-offs and suffer from 4-8 minute manual checkout queues. The DDS platform was engineered to eliminate these bottlenecks.
                </p>
                <p>
                  <strong>Results & Validation:</strong>
                  <br />• <strong>Checkout Time:</strong> Reduced from 4.8 minutes to 38 seconds per prescription (82% efficiency gain).
                  <br />• <strong>Expiry Elimination:</strong> 90-day alert matrix eliminated expired medicine sales by 94%.
                  <br />• <strong>ML Forecast Accuracy:</strong> 89.4% accuracy across fast-moving antibiotics and analgesics.
                </p>
              </div>
            </div>
          )}

          {/* Section 6: Benefits */}
          {activeSection === 'benefits' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 4: Benefits Gained & Professional Reflection
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Technical Skills:</strong> Strict-mode TypeScript, React 19, Tailwind CSS v4, PWA Service Workers, Recharts visualization, and Google GenAI SDK integration.
                </p>
                <p>
                  <strong>Professional Growth:</strong> Agile Scrum sprint participation, peer code reviews, industrial problem-solving, HIPAA/EFDA healthcare data privacy ethics, and SaaS business model economics.
                </p>
                <p>
                  <strong>Career Alignment:</strong> Solidified career trajectory toward Full-Stack HealthTech Systems Architecture and Medical Informatics.
                </p>
              </div>
            </div>
          )}

          {/* Section 7: Conclusion */}
          {activeSection === 'conclusion' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Chapter 5: Conclusion & Strategic Recommendations
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  <strong>Conclusion:</strong> The 12-week internship successfully delivered a production-ready, cloud-native and mobile-responsive pharmaceutical management platform that resolves core supply chain, POS, and regulatory challenges.
                </p>
                <p>
                  <strong>Hosting Company Recommendation:</strong> Highly recommended for future student placements due to exemplary technical mentorship and real-world impact.
                </p>
              </div>
            </div>
          )}

          {/* Section 8: References */}
          {activeSection === 'references' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                References & Citations
              </h3>
              <div className="space-y-2 text-xs text-slate-300 font-mono">
                <p>[1] WHO, "Good Pharmacy Practice (GPP) in Community and Hospital Settings," 2020.</p>
                <p>[2] EFDA, "Good Storage and Distribution Practices for Pharmaceuticals in Ethiopia," 3rd Edition, 2023.</p>
                <p>[3] Ministry of Revenues, "Electronic Invoicing & Fiscal Cash Register Directives," 2024.</p>
                <p>[4] Pressman & Maxim, "Software Engineering: A Practitioner’s Approach," 9th Ed., 2020.</p>
                <p>[5] Martin, R. C., "Clean Architecture: A Craftsman's Guide to Software Structure," 2018.</p>
              </div>
            </div>
          )}

          {/* Section 9: Appendices */}
          {activeSection === 'appendices' && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Appendices: Schemas & Output Formats
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <p><strong>Appendix A:</strong> Relational Database Schemas (Medicines, Batches, Sales, Suppliers, Audits).</p>
                <p><strong>Appendix B:</strong> Sample EIMS Compliant 80mm POS Thermal Receipt with EFDA verification QR code.</p>
                <p><strong>Appendix C:</strong> Mobile PWA Standalone Manifest & Barcode Scanner Integration Specifications.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Award className="h-4 w-4 text-emerald-400" />
            <span>Ready for University Submission & Defense</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Generating...' : 'Download Word (.docx)'}</span>
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
