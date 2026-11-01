import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Download,
  X,
  ShieldCheck,
  AlertTriangle,
  Play,
  Share2,
  Layers,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PhoneConnectQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulator?: () => void;
}

export const PhoneConnectQrModal: React.FC<PhoneConnectQrModalProps> = ({
  isOpen,
  onClose,
  onOpenSimulator,
}) => {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'troubleshoot' | 'features'>('qr');

  // Deep link URLs - enforce HTTPS for mobile camera access and secure transit
  const getSecureMobileLink = () => {
    let origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!origin) return 'https://ais-pre-leozf7qd26ta7bgww7m4mw-648174942624.europe-west2.run.app?flutter_pos=true';
    if (origin.startsWith('http://')) {
      origin = origin.replace('http://', 'https://');
    }
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    return `${origin}?flutter_pos=true`;
  };

  const mobileLink = getSecureMobileLink();

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(mobileLink, {
      width: 340,
      margin: 2,
      color: {
        dark: '#022c22', // Deep emerald
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((dataUri) => setQrDataUrl(dataUri))
      .catch((err) => console.error('Failed to generate Phone Connect QR:', err));
  }, [isOpen, mobileLink]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mobileLink);
    setCopied(true);
    showToast('Mobile POS link copied to clipboard!', 'success', 'Link Copied');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'dds-mobile-pos-qr.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR Code image downloaded.', 'info', 'Downloaded');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Mobile POS & Phone Sync</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                  PWA / COUNTER APP
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Staff barcode scanner, express cashier POS, and live inventory companion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-1 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Connect QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'troubleshoot'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
            <span>Phone 403 / Connection Help</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'bg-slate-800 text-emerald-400 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mobile App Features</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'qr' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* QR Image Box */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-emerald-500/30 flex flex-col items-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Mobile Connect QR"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-500">
                      Generating high-resolution QR...
                    </div>
                  )}
                  <div className="mt-2 text-center">
                    <span className="text-[11px] font-black text-slate-900 tracking-wide block">
                      SCAN TO OPEN MOBILE POS
                    </span>
                    <span className="text-[9px] text-emerald-800 font-mono font-bold">
                      Direct App Deep Link
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 w-full max-w-[220px]">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Save QR</span>
                  </button>
                  <a
                    href={mobileLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-emerald-800"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>New Tab</span>
                  </a>
                </div>
              </div>

              {/* Install & Instant Action Box */}
              <div className="md:col-span-7 space-y-4">
                {/* Instant Simulator Callout (ZERO 403 ISSUES) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-700/80 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5 fill-current text-emerald-400" />
                      Instant On-Screen Smartphone Test
                    </span>
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Test the complete mobile experience right on this screen with interactive camera barcode scanning, cashier ringing, and live inventory sync!
                  </p>
                  {onOpenSimulator && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSimulator();
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md mt-1"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span>Launch Interactive Phone Simulator</span>
                    </button>
                  )}
                </div>

                {/* Direct Link Input */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Mobile POS URL:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={mobileLink}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shrink-0"
                      title="Copy URL"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick note on 403 */}
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <strong className="block text-amber-300">Getting a 403 Forbidden on your phone?</strong>
                    <span>Google AI Studio dev sandboxes require being logged into your Google account on your mobile browser. Tap the <strong>"Phone 403 / Connection Help"</strong> tab above for the 3 easy solutions.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-800/60 space-y-2">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Why does scanning the QR code show "403 Forbidden"?</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The application is currently running in a private Google AI Studio development container. Google Cloud requires authentication to access development preview environments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Solution 1 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-800/80 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded-md border border-emerald-800">
                      Option 1: Fastest
                    </span>
                    <h4 className="text-xs font-bold text-white mt-2">Use Built-in Simulator</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      Launch the 100% full-featured virtual smartphone on your desktop with live barcode scanning, staff PINs, and cart management.
                    </p>
                  </div>
                  {onOpenSimulator && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSimulator();
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Open Simulator</span>
                    </button>
                  )}
                </div>

                {/* Solution 2 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] bg-sky-950 text-sky-400 font-bold px-2 py-0.5 rounded-md border border-sky-800">
                      Option 2: Physical Phone
                    </span>
                    <h4 className="text-xs font-bold text-white mt-2">Log in on Mobile Browser</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      Open Chrome or Safari on your phone and ensure you are signed into the same Google Account you use for Google AI Studio. Then open the link.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy Link for Phone</span>
                  </button>
                </div>

                {/* Solution 3 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] bg-purple-950 text-purple-400 font-bold px-2 py-0.5 rounded-md border border-purple-800">
                      Option 3: Public Share
                    </span>
                    <h4 className="text-xs font-bold text-white mt-2">Share from AI Studio</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      Click the <strong>Share</strong> button in the top right of AI Studio to generate a public preview link for anyone on any device.
                    </p>
                  </div>
                  <a
                    href={mobileLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Test in New Tab</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>⚡ Instant Barcode Scanning</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Use smartphone camera or integrated USB/Bluetooth barcode scanner to add medications directly to patient sales orders.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-sky-400 flex items-center gap-1.5">
                    <span>🧾 Counter Checkout & Receipts</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Ring up customers with automated tax calculation, discounts, cash/card/insurance tenders, and 80mm thermal receipts.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-400 flex items-center gap-1.5">
                    <span>📦 Real-time Shelf Inventory Sync</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Perform quick stock lookups, batch expiry verification, and shelf audits that synchronize immediately with the main pharmacy system.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>📱 PWA Offline Standalone Mode</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Add to iPhone or Android home screen for native fullscreen experience, offline caching, and responsive haptics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span>Fully integrated with DDS Pharmacy inventory database</span>
          </span>
          <div className="flex items-center gap-2">
            {onOpenSimulator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSimulator();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                Launch Simulator
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
