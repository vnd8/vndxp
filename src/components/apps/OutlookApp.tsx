import React, { useState } from 'react';
import { ClientInquiry } from '../../types';
import { ANES_PROFILE } from '../../data/portfolioData';
import { sound } from '../../utils/audio';

interface OutlookAppProps {
  onInquirySubmitted: (inquiry: ClientInquiry) => void;
}

export const OutlookApp: React.FC<OutlookAppProps> = ({ onInquirySubmitted }) => {
  const [clientName, setClientName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [projectType, setProjectType] = useState('YouTube / High-Retention Video');
  
  // Free text inputs for Duration, Currency, and Budget as explicitly requested!
  const [duration, setDuration] = useState('8-12 minutes');
  const [currency, setCurrency] = useState('USD');
  const [budgetAmount, setBudgetAmount] = useState('400');
  const [details, setDetails] = useState('');

  const [sentSuccess, setSentSuccess] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !contactInfo.trim()) {
      sound.playAlert();
      alert('Please provide your name and contact info (Email or WhatsApp).');
      return;
    }

    const newInquiry: ClientInquiry = {
      id: `inq-${Date.now()}`,
      clientName: clientName.trim(),
      contactInfo: contactInfo.trim(),
      projectType: projectType.trim(),
      duration: duration.trim() || 'Flexible',
      currency: currency.trim() || 'USD',
      budget: `${currency.trim() || 'USD'} ${budgetAmount.trim()}`,
      details: details.trim() || 'No additional details provided.',
      createdAt: 'Just now',
      status: 'new',
    };

    onInquirySubmitted(newInquiry);
    sound.playStartup();
    setSentSuccess(true);
  };

  const handleWhatsAppDirect = () => {
    sound.playClick();
    const formattedBudget = `${currency.trim() || 'USD'} ${budgetAmount.trim()}`;
    const text = encodeURIComponent(
      `Hello Anes (@vnd8d), I would like to inquire about video editing services:\n- Name: ${clientName || 'Client'}\n- Project: ${projectType}\n- Estimated Duration: ${duration}\n- Target Budget: ${formattedBudget}\n- Notes: ${details || 'Looking to discuss collaboration'}`
    );
    window.open(`https://wa.me/213555952379?text=${text}`, '_blank');
  };

  const handleCopyEmail = () => {
    sound.playAlert();
    navigator.clipboard.writeText(ANES_PROFILE.email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  if (sentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-[#ece9d8] text-center select-none font-sans">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center text-3xl mb-3 shadow-md">
          ✓
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-1">
          Inquiry Successfully Sent to Anes! 🎬
        </h3>
        <p className="text-xs text-neutral-600 max-w-md mb-4 leading-relaxed">
          Thank you for reaching out. Your request has been queued. Anes will review your footage specs and contact you at ({contactInfo}) shortly. You can also message directly on WhatsApp to expedite the response.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleWhatsAppDirect}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
          >
            <span>💬</span>
            <span>Continue on WhatsApp (+213)</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSentSuccess(false);
              setDetails('');
            }}
            className="px-4 py-2 rounded border border-neutral-400 bg-white hover:bg-neutral-100 text-neutral-800 text-xs cursor-pointer"
          >
            Send Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f4f2e8] text-xs text-neutral-800 select-none overflow-y-auto font-sans">
      {/* Outlook Toolbar */}
      <div className="bg-[#ece9d8] border-b border-[#d4d0c8] p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            className="px-3 py-1 rounded bg-[#0058e6] hover:bg-[#1569f2] text-white font-bold text-xs shadow flex items-center gap-1 cursor-pointer"
          >
            <span>📨</span>
            <span>Send Inquiry</span>
          </button>
          <button
            onClick={handleWhatsAppDirect}
            className="px-3 py-1 rounded bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow flex items-center gap-1 cursor-pointer"
          >
            <span>💬</span>
            <span>Direct WhatsApp (+213)</span>
          </button>
          <button
            onClick={handleCopyEmail}
            className="px-2.5 py-1 rounded border border-neutral-400 bg-white hover:bg-neutral-100 flex items-center gap-1 cursor-pointer text-neutral-700"
          >
            <span>📧</span>
            <span>{emailCopied ? 'Email Copied!' : 'Copy Email'}</span>
          </button>
        </div>
        <div className="text-[11px] text-neutral-500 hidden sm:block">
          Outlook Express v6.0
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 flex-1 flex flex-col">
        {/* Recipient */}
        <div className="flex items-center gap-2 bg-white border border-[#7f9db9] p-1.5 rounded">
          <span className="w-24 font-bold text-neutral-600 px-1 border-r border-neutral-300">To:</span>
          <span className="font-semibold text-[#0058e6]">Anes (@vnd8d) — chattivon@gmail.com</span>
        </div>

        {/* Client Name */}
        <div className="flex items-center gap-2 bg-white border border-[#7f9db9] p-1.5 rounded">
          <span className="w-24 font-bold text-neutral-600 px-1 border-r border-neutral-300">Your Name / Channel:</span>
          <input
            type="text"
            required
            placeholder="e.g. Liam / Modern Tech Media"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-xs"
          />
        </div>

        {/* Contact info */}
        <div className="flex items-center gap-2 bg-white border border-[#7f9db9] p-1.5 rounded">
          <span className="w-24 font-bold text-neutral-600 px-1 border-r border-neutral-300">Contact Info:</span>
          <input
            type="text"
            required
            placeholder="Email address or WhatsApp phone number"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-xs"
          />
        </div>

        {/* Custom Project Specifications Row (Free duration, free written currency, free budget) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Project Type */}
          <div className="bg-white border border-[#7f9db9] p-2 rounded flex flex-col gap-1">
            <label className="text-[11px] font-bold text-neutral-600">Project Type:</label>
            <input
              type="text"
              required
              placeholder="e.g. YouTube, Gaming, Reel..."
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded p-1 text-xs focus:outline-none"
            />
          </div>

          {/* Video Duration (FREE WRITTEN TEXT INPUT) */}
          <div className="bg-white border border-[#7f9db9] p-2 rounded flex flex-col gap-1">
            <label className="text-[11px] font-bold text-neutral-600">Video Duration:</label>
            <input
              type="text"
              required
              placeholder="e.g. 10 mins, 45 secs, 2 hours..."
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-neutral-50 border border-neutral-300 rounded p-1 text-xs focus:outline-none font-semibold text-[#0058e6]"
            />
          </div>

          {/* Budget with FREE WRITTEN CURRENCY & FREE AMOUNT */}
          <div className="bg-white border border-[#7f9db9] p-2 rounded flex flex-col gap-1">
            <label className="text-[11px] font-bold text-neutral-600">Currency & Budget Amount:</label>
            <div className="flex gap-1.5">
              {/* Written currency text input (e.g. USD, ريال, SAR, EUR, DZD) */}
              <input
                type="text"
                required
                placeholder="Currency (USD, ريال, DZD...)"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-24 bg-neutral-50 border border-neutral-300 rounded p-1 text-xs focus:outline-none font-bold uppercase text-neutral-800"
              />
              {/* Budget amount input */}
              <input
                type="text"
                required
                placeholder="Amount (e.g. 400, 1500...)"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                className="flex-1 bg-neutral-50 border border-neutral-300 rounded p-1 text-xs focus:outline-none font-semibold text-[#0058e6]"
              />
            </div>
          </div>
        </div>

        {/* Project Notes & Raw Footage Links */}
        <div className="flex-1 bg-white border border-[#7f9db9] p-2.5 rounded flex flex-col">
          <label className="text-[11px] font-bold text-neutral-600 mb-1">
            Project Concept, Raw Footage Link (Drive / Dropbox), or Style References:
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe your editing style, reference videos you like, deadline, or paste cloud storage links to raw files..."
            className="flex-1 w-full bg-transparent focus:outline-none text-xs resize-none leading-relaxed"
            rows={5}
          />
        </div>

        {/* Submit banner */}
        <div className="bg-[#ece9d8] p-2 rounded border border-[#d4d0c8] flex items-center justify-between">
          <span className="text-[11px] text-neutral-600">
            ⚡ Quick turnaround guaranteed. Sample edits available for ongoing contracts!
          </span>
          <button
            type="submit"
            className="px-4 py-1.5 rounded bg-[#0058e6] hover:bg-[#1569f2] text-white font-bold text-xs shadow border border-white/40 cursor-pointer"
          >
            Submit Inquiry Now 🚀
          </button>
        </div>
      </form>
    </div>
  );
};
