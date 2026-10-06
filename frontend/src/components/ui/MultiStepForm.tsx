import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Send, MessageCircle } from 'lucide-react';
import { sanitizeInput, contactFormSchema } from '../../lib/validation';
import { trackContactForm } from '../../lib/analytics';
import { request } from '../../lib/http';
import { checkRateLimit } from '../../lib/rateLimit';

const steps = [
  {
    id: 'service',
    title: 'What do you need help with?',
    options: [
      { value: 'website', label: 'Website' },
      { value: 'seo', label: 'SEO' },
      { value: 'digital-marketing', label: 'Digital Marketing' },
      { value: 'photography', label: 'Photography' },
      { value: 'graphic-design', label: 'Graphic Design' },
      { value: 'full-service', label: 'Full Service Package' },
    ],
  },
  {
    id: 'business',
    title: 'What type of business do you have?',
    options: [
      { value: 'hotel-riad', label: 'Hotel / Riad' },
      { value: 'restaurant-cafe', label: 'Restaurant / Café' },
      { value: 'real-estate', label: 'Real Estate Agency' },
      { value: 'ecommerce', label: 'E-commerce' },
      { value: 'medical', label: 'Medical / Healthcare' },
      { value: 'lawyer', label: 'Law Firm' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'budget',
    title: 'What is your estimated budget?',
    options: [
      { value: 'under-5000', label: 'Under 5,000 MAD' },
      { value: '5000-10000', label: '5,000 – 10,000 MAD' },
      { value: '10000-20000', label: '10,000 – 20,000 MAD' },
      { value: '20000-50000', label: '20,000 – 50,000 MAD' },
      { value: '50000-plus', label: '50,000+ MAD' },
    ],
  },
  {
    id: 'timeline',
    title: 'What is your priority?',
    options: [
      { value: 'urgent', label: 'Urgent' },
      { value: 'within-30-days', label: 'Within 30 Days' },
      { value: 'flexible', label: 'Flexible' },
    ],
  },
];

interface FormData {
  service: string;
  business: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  honeypot: string;
}

const initialState: FormData = {
  service: '',
  business: '',
  budget: '',
  timeline: '',
  name: '',
  email: '',
  phone: '',
  message: '',
  honeypot: '',
};

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    setStartTime(Date.now());
    trackContactForm('Started');
  }, []);

  const totalSteps = steps.length + 1;

  const handleOptionSelect = (value: string) => {
    const fieldId = steps[currentStep].id;
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const canProceed = () => {
    if (currentStep < steps.length) {
      const fieldId = steps[currentStep].id;
      return formData[fieldId as keyof FormData] !== '';
    }
    return formData.name.trim() !== '' && formData.email.trim() !== '';
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    setError(null);
    trackContactForm('Submitted');

    // Bot detection & Spam protection
    if (formData.honeypot !== '') {
      setError('Invalid submission.');
      trackContactForm('Error');
      return;
    }

    const submissionTime = Date.now() - startTime;
    if (submissionTime < 3000) {
      setError('Please take your time to fill the form.');
      trackContactForm('Error');
      return;
    }

    if (!checkRateLimit('contact_form', 3, 60000 * 60)) { // 3 per hour
      setError('Too many attempts. Please try again later.');
      trackContactForm('Error');
      return;
    }

    try {
      const sanitizedData = {
        ...formData,
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        message: sanitizeInput(formData.message),
      };

      contactFormSchema.parse(sanitizedData);

      setIsSubmitting(true);
      await request('/session');
      await request('/enquiries', { method: 'POST', body: JSON.stringify(sanitizedData) });
      setIsSubmitting(false);
      setIsSubmitted(true);
      trackContactForm('Success');

    } catch (e: any) {
      setError(e.errors?.[0]?.message || e.message || 'Please check your inputs and try again.');
      trackContactForm('Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          <Check className="w-10 h-10" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-4">Enquiry received!</h3>
        <p className="text-secondary mb-8">Thank you for reaching out. Your enquiry has been saved. You can also contact me on WhatsApp.</p>
        <motion.a
          href="https://wa.me/212708295518"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary inline-flex"
        >
          <MessageCircle className="mr-2 w-5 h-5" />
          Continue on WhatsApp
        </motion.a>
      </motion.div>
    );
  }

  return (
    <div className="card p-8 lg:p-12">
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted">Step {currentStep + 1} of {totalSteps}</span>
          <span className="text-sm text-muted">{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center"
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors`}
                style={{
                  backgroundColor: index <= currentStep ? 'var(--accent)' : 'var(--muted)',
                  color: index <= currentStep ? 'var(--accent-foreground)' : 'var(--text-muted)',
                }}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </motion.div>
              <span className="text-xs text-muted mt-1 hidden md:block">{step.id}</span>
            </div>
          ))}
          <div className="flex flex-col items-center">
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors`}
              style={{
                backgroundColor: currentStep === steps.length ? 'var(--accent)' : 'var(--muted)',
                color: currentStep === steps.length ? 'var(--accent-foreground)' : 'var(--text-muted)',
              }}
            >
              {currentStep > steps.length ? <Check className="w-4 h-4" /> : steps.length + 1}
            </motion.div>
            <span className="text-xs text-muted mt-1 hidden md:block">Contact</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep < steps.length ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-8">{steps[currentStep].title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {steps[currentStep].options.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`p-4 rounded-xl text-left transition-all duration-300 ${
                    formData[steps[currentStep].id as keyof FormData] === option.value
                      ? 'ring-2'
                      : ''
                  }`}
                  style={{
                    backgroundColor:
                      formData[steps[currentStep].id as keyof FormData] === option.value
                        ? 'var(--accent)'
                        : 'var(--muted)',
                    color:
                      formData[steps[currentStep].id as keyof FormData] === option.value
                        ? 'var(--accent-foreground)'
                        : 'var(--foreground)',
                    border: '1px solid var(--border)',
                    ...(formData[steps[currentStep].id as keyof FormData] === option.value && {
                      ['--tw-ring-color' as string]: 'var(--accent)',
                    }),
                  }}
                >
                  <span className="font-medium">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="contact"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-8">Your Contact Information</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm text-secondary mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-secondary mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm text-secondary mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                  placeholder="+212 708 295518"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm text-secondary mb-2">
                  Additional Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-primary placeholder:text-muted focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    backgroundColor: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                  placeholder="Tell me more about your project..."
                />
              </div>

              {/* Honeypot field for spam protection */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <label htmlFor="honeypot">Leave this field blank if you are human</label>
                <input
                  type="text"
                  id="honeypot"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleInputChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${
            currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            backgroundColor: 'var(--muted)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        {currentStep < steps.length ? (
          <motion.button
            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              backgroundColor: canProceed() ? 'var(--accent)' : 'var(--muted)',
              color: canProceed() ? 'var(--accent-foreground)' : 'var(--text-muted)',
            }}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              !canProceed() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              backgroundColor: canProceed() && !isSubmitting ? 'var(--accent)' : 'var(--muted)',
              color: canProceed() && !isSubmitting ? 'var(--accent-foreground)' : 'var(--text-muted)',
            }}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
