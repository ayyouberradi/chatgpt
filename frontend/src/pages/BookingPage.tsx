import { FormEvent, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { request } from '../lib/http';

const sources = ['website', 'hero', 'header', 'booking_section', 'footer', 'contact_page', 'final_cta', 'floating_button'];
export default function BookingPage() {
  const [params] = useSearchParams();
  const submissionKey = useRef(crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ reference: string; whatsapp_url: string } | null>(null);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Casablanca';
  const whatsapp = params.get('channel') === 'whatsapp';
  const inputClass = 'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError('');
    try {
      await request('/session');
      const received = await request<{ reference: string; whatsapp_url: string }>('/bookings', { method: 'POST', body: JSON.stringify({ ...fields, intent: whatsapp ? 'whatsapp' : 'discovery_call', booking_timezone: timezone, whatsapp_consent: fields.whatsapp_consent === 'on', submission_key: submissionKey.current, source: sources.includes(params.get('source') || '') ? params.get('source') : 'website' }) });
      setResult(received);
      window.location.assign(received.whatsapp_url);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save your request. Please try again.'); }
    finally { setBusy(false); }
  }
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return <main className="max-w-2xl mx-auto px-6 pt-36 pb-24">
    <h1 className="text-4xl font-bold mb-4">{whatsapp ? 'Start a WhatsApp conversation' : 'Request a discovery call'}</h1>
    <p className="text-secondary mb-8">Tell me what you need. Your request will be saved, then WhatsApp will open with all your enquiry details ready to send. A preferred time is a request; I will confirm availability with you.</p>
    {result ? <section className="p-8 rounded-2xl border border-[var(--border)]" aria-live="polite">
      <h2 className="text-2xl font-bold mb-3">Request received</h2><p className="mb-6">Your reference is {result.reference}. Tap Send in WhatsApp to share your details. If WhatsApp did not open, use the button below. Your appointment is awaiting confirmation.</p>
      <a className="btn-primary inline-block" href={result.whatsapp_url} target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>
    </section> : <form onSubmit={submit} className="space-y-5">
      <label className="block">Name<input className={inputClass} name="name" autoComplete="name" maxLength={150} required /></label>
      <label className="block">Email<input className={inputClass} name="email" type="email" autoComplete="email" maxLength={255} required /></label>
      <label className="block">WhatsApp number<input className={inputClass} name="phone" type="tel" autoComplete="tel" placeholder="+212 6…" maxLength={60} required /><span className="text-sm text-secondary">Include your country code, for example +212 or +33.</span></label>
      <label className="block">Service<select className={inputClass} name="service" defaultValue="consultation"><option value="consultation">Help choosing a service</option><option value="website">Website</option><option value="seo">SEO</option><option value="digital-marketing">Digital marketing</option><option value="photography">Photography</option><option value="graphic-design">Graphic design</option><option value="full-service">Full service package</option></select></label>
      <fieldset><legend className="mb-2">Preferred time (optional)</legend><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label>Date<input className={inputClass} name="preferred_date" type="date" min={minDate} /></label><label>Time<input className={inputClass} name="preferred_time" type="time" /></label></div><p className="text-sm text-secondary mt-2">Your timezone: {timezone}. Leave both fields empty for a flexible time.</p></fieldset>
      <label className="block">What would you like to discuss?<textarea className={inputClass} name="message" maxLength={5000} rows={4} /></label>
      <div hidden aria-hidden="true"><label>Website<input name="honeypot" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="flex gap-3 items-start"><input className="mt-1" type="checkbox" name="whatsapp_consent" required /><span>I agree to receive WhatsApp messages about this request, appointment confirmation, and follow-up. I can opt out at any time by replying STOP.</span></label>
      {error && <p role="alert" className="text-red-500">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : 'Save request & open WhatsApp'}</button>
    </form>}
  </main>;
}
