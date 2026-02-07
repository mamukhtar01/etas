"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, 
  Mail, 
  Globe, 
  MessageSquare, 
  Send,
  MapPin,
  Clock
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Add logic here to send email via Supabase Edge Functions or EmailJS
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Contact Support</h1>
        </div>
        <Image src="/logo.svg" alt="Logo" width={40} height={40} />
      </div>

      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Left Column: Official Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Get in Touch</h2>
              <p className="text-slate-600 leading-relaxed">
                Our support team is dedicated to assisting you with your eTAS application and travel inquiries.
              </p>
            </div>

            <div className="space-y-6">
              {/* <ContactInfoItem 
                icon={<Mail className="text-blue-600" size={20} />} 
                label="Email Support" 
                value="visa.dept@immigration.gov.so" 
                link="mailto:visa.dept@immigration.gov.so"
              /> */}
              {/* <ContactInfoItem 
                icon={<Globe className="text-blue-600" size={20} />} 
                label="Official Website" 
                value="www.immigration.gov.so" 
                link="https://www.immigration.gov.so"
              />
              <ContactInfoItem 
                icon={<MapPin className="text-blue-600" size={20} />} 
                label="Headquarters" 
                value="Mogadishu, Somalia" 
              /> */}
              <ContactInfoItem 
                icon={<Clock className="text-blue-600" size={20} />} 
                label="Working Hours" 
                value="Sat - Thu: 8:00 AM - 4:00 PM" 
              />
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 text-blue-700 font-bold mb-2">
                <MessageSquare size={20} />
                <span>Need immediate help?</span>
              </div>
              <p className="text-sm text-blue-600/80 leading-relaxed">
                Check our <Link href="/guidelines" className="underline font-semibold">Guidelines</Link> page for answers to commonly asked questions regarding processing times and document requirements.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-10">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500 mb-8">Thank you for reaching out. We will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-blue-600 font-bold hover:text-blue-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Email Address</label>
                      <input 
                        required 
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Application Number (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. FGS-12345678"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Message</label>
                    <textarea 
                      required 
                      rows={5} 
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function ContactInfoItem({ icon, label, value, link }: { icon: React.ReactNode, label: string, value: string, link?: string }) {
  const content = (
    <div className="flex items-start gap-4 p-2 group">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-slate-900 font-semibold ${link ? 'group-hover:text-blue-600 transition-colors' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );

  return link ? <a href={link} target="_blank" rel="noopener noreferrer">{content}</a> : content;
}