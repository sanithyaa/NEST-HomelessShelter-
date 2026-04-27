'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  ChevronDown, 
  Mail, 
  MessageSquare, 
  BookOpen,
  Users,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SUPPORT_EMAIL } from '@/lib/appInfo';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (!session) {
      router.push('/auth/login');
      return;
    }
    setMounted(true);
  }, [router]);

  const faqs: FAQItem[] = [
    {
      question: 'How do I add a new profile?',
      answer: 'Navigate to the Profiles section from the sidebar and click "Create Profile". Fill in the required information including name, age, and needs. You can also add optional details like health conditions and skills. The profile will be saved automatically as you progress through the steps.',
    },
    {
      question: 'What happens if I\'m offline?',
      answer: 'NEST works offline! When you create or edit data while offline, it\'s saved locally on your device. Once you\'re back online, click "Sync Now" in the Settings page or use the sync button in the navbar to upload your changes to the server.',
    },
    {
      question: 'How do I switch language?',
      answer: 'You can change the language in two ways: 1) Click the globe icon in the navbar and select your preferred language, or 2) Go to Settings > Language & Localization and choose from the dropdown menu. Currently, we support English and Hindi (हिंदी).',
    },
    {
      question: 'How do I add shelters or jobs?',
      answer: 'If you have NGO or Admin role, navigate to Resources > Shelters or Resources > Jobs from the sidebar. Click the "Add" button and fill in the details. Make sure to include capacity information for shelters and wage details for jobs.',
    },
    {
      question: 'What are matches and how do they work?',
      answer: 'Matches are AI-powered recommendations that connect individuals with suitable resources like shelters, jobs, medical facilities, or training programs. The system analyzes profile needs and available resources to suggest the best matches with a compatibility score.',
    },
    {
      question: 'How do I export reports?',
      answer: 'Go to the Reports page (available for NGO and Admin roles). You can export data in two formats: CSV for spreadsheet analysis, or PDF for printable reports. Use the date range selector to filter the data you want to export.',
    },
    {
      question: 'Can I access the app on mobile?',
      answer: 'Yes! NEST is fully responsive and works on all devices including smartphones and tablets. The interface adapts to your screen size for optimal usability.',
    },
    {
      question: 'How do I clear my offline data?',
      answer: 'Go to Settings > Offline Data and click "Clear Offline Data". This will remove all locally stored drafts and pending items. Make sure to sync your data before clearing if you want to keep any changes.',
    },
  ];

  const handleSubmitContact = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    // Mock submission
    toast.success('Message sent! We\'ll get back to you soon.');
    setMessage('');
    setShowContactForm(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mx-auto"></div>
          <p className="mt-4 text-brown-600 dark:text-brown-400">Loading help...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-brown-900 dark:text-cream-50 mb-2">
            {t('nav.help')}
          </h1>
          <p className="text-brown-600 dark:text-brown-400">
            Find answers and get support for using NEST
          </p>
        </motion.div>

        {/* Getting Started */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-brown-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-brown-900 dark:text-cream-50">
              Getting Started
            </h2>
          </div>
          
          <div className="space-y-4 text-brown-700 dark:text-brown-300">
            <div>
              <h3 className="font-semibold text-brown-900 dark:text-cream-50 mb-2">
                Using the Dashboard
              </h3>
              <p className="text-sm">
                Your dashboard provides an overview of key metrics and recent activity. 
                Use the sidebar to navigate between different sections like Profiles, Resources, and Matches.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-brown-900 dark:text-cream-50 mb-2">
                Creating Profiles
              </h3>
              <p className="text-sm">
                Click "Create Profile" to add a new individual to the system. The 6-step wizard 
                guides you through collecting essential information. Your progress is saved automatically, 
                so you can return later if needed.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-brown-900 dark:text-cream-50 mb-2">
                Working Offline
              </h3>
              <p className="text-sm">
                NEST works even without internet! Any changes you make offline are stored 
                locally and will sync automatically when you're back online. Check the sync indicator 
                in the navbar to see pending items.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-brown-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-brown-900 dark:text-cream-50 mb-4">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-brown-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-brown-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-brown-900 dark:text-cream-50">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-brown-600 dark:text-brown-400 transition-transform ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <AnimatePresence>
                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-sm text-brown-700 dark:text-brown-300 bg-brown-50 dark:bg-gray-700/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-brown-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-brown-900 dark:text-cream-50">
              Contact Support
            </h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-brown-700 dark:text-brown-300">
              Need more help? Our support team is here to assist you.
            </p>
            
            <div className="flex items-center gap-2 text-brown-700 dark:text-brown-300">
              <Mail className="w-5 h-5" />
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-amber-600 dark:text-amber-400 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
            
            <button
              onClick={() => setShowContactForm(true)}
              className="w-full px-4 py-3 bg-brown-600 hover:bg-brown-700 text-white rounded-lg transition-colors font-medium"
            >
              Report an Issue
            </button>
          </div>
        </motion.div>

        {/* Acknowledgements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-brown-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
              <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-xl font-semibold text-brown-900 dark:text-cream-50">
              Acknowledgements
            </h2>
          </div>
          
          <div className="space-y-3 text-brown-700 dark:text-brown-300">
            <p>
              NEST is made possible by the dedication of volunteers, NGO partners, 
              and community supporters who work tirelessly to help those in need.
            </p>
            
            <div className="flex items-start gap-2">
              <Users className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-brown-900 dark:text-cream-50">
                  Special Thanks To:
                </p>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• Local NGOs and shelter operators</li>
                  <li>• Volunteer coordinators and field workers</li>
                  <li>• Technology partners and contributors</li>
                  <li>• Community members who provide feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-brown-900 dark:text-cream-50 mb-4">
              Report an Issue
            </h3>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue you're experiencing..."
              className="w-full px-4 py-3 border border-brown-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-transparent bg-white dark:bg-gray-700 text-brown-900 dark:text-cream-50 min-h-[120px] resize-none"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowContactForm(false);
                  setMessage('');
                }}
                className="flex-1 px-4 py-2 border border-brown-300 dark:border-gray-600 text-brown-700 dark:text-brown-300 rounded-lg hover:bg-brown-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitContact}
                className="flex-1 px-4 py-2 bg-brown-600 hover:bg-brown-700 text-white rounded-lg transition-colors"
              >
                Send Message
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
