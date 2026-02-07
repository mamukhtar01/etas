"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, 
  Clock, 
  FileText, 
  CreditCard, 
  HelpCircle,
  AlertCircle,
  Zap 
} from "lucide-react";

export default function GuidelinesPage() {
  return (
    <main className="min-h-screen w-full bg-slate-50 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Application Guidelines</h1>
        </div>
        <Image src="/logo.svg" alt="Logo" width={40} height={40} />
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">How to Apply for eTAS</h2>
          <p className="text-slate-600 leading-relaxed">
            The Electronic Travel Authorization System (eTAS) is a mandatory requirement for foreign nationals 
            entering the Federal Republic of Somalia. Our streamlined digital process ensures your authorization 
            is ready as soon as your application is reviewed.
          </p>
        </header>

        {/* Requirements Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <GuidelineCard 
            icon={<FileText className="text-blue-600" />}
            title="Documents Needed"
            description="A valid passport (minimum 6 months validity), a recent digital passport-sized photo, and travel itinerary."
          />
          <GuidelineCard 
            icon={<Zap className="text-amber-600" />}
            title="Instant Issuance"
            description="Your travel authorization is processed and issued immediately once your application has been approved by the department."
          />
          <GuidelineCard 
            icon={<CreditCard className="text-green-600" />}
            title="Validity Period"
            description="The eTAS is valid for 90 days from the date of issue and allows for a single entry into the country."
          />
          <GuidelineCard 
            icon={<AlertCircle className="text-red-600" />}
            title="Important Note"
            description="Providing false information is a criminal offense. Ensure all data matches your passport exactly."
          />
        </div>

        {/* Detailed Steps */}
        <section className="bg-white rounded-2xl shadow-sm border p-8 mb-12">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Step-by-Step Process</h3>
          <div className="space-y-8">
            <Step 
                number="1" 
                title="Fill the Online Form" 
                body="Enter your personal details, passport information, and visit details accurately into our secure portal." 
            />
            <Step 
                number="2" 
                title="Review & Submit" 
                body="Double-check all fields. Once submitted, your application enters the official review queue." 
            />
            <Step 
                number="3" 
                title="Immediate Issuance" 
                body="Immediately upon approval, your eTAS document is generated. You can download and print it instantly from the 'Check Application' page." 
            />
            <Step 
                number="4" 
                title="Border Verification" 
                body="Upon arrival, present the physical colored copy of your eTAS and your passport to the immigration officer for final clearance." 
            />
          </div>
        </section>

        {/* FAQ Redirect */}
        <div className="bg-blue-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <HelpCircle size={40} className="text-blue-200" />
            <div>
              <h4 className="text-xl font-bold">Have more questions?</h4>
              <p className="text-blue-100 text-sm">Our support team is available during official working hours to assist you.</p>
            </div>
          </div>
          <Link href="/contact" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}

function GuidelineCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-4 p-3 bg-slate-50 w-fit rounded-lg">{icon}</div>
      <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, body }: { number: string, title: string, body: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h5 className="font-bold text-slate-900 mb-1">{title}</h5>
        <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}