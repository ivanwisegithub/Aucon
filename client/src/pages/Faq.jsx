import React, { useState } from 'react';

export default function FAQ() {
  const [activeTab, setActiveTab] = useState('General');
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = {
    General: [
      {
        question: 'What is the Secure Student Feedback & Welfare Suite (SSFWS)?',
        answer: 'It’s a platform that empowers students to submit concerns, suggestions, and monitor welfare issues securely and anonymously.',
      },
      {
        question: 'Who can access SSFWS?',
        answer: 'All registered students and authorized student union representatives at Africa University can use the platform.',
      },
      {
        question: 'Can I propose ideas for improving campus life?',
        answer: 'Yes, you can propose ideas under the "Welfare Initiatives" category. Your suggestions will be reviewed and forwarded to relevant departments.',
      },
      {
        question: 'What’s the main goal of SSFWS?',
        answer: 'To create a responsive, student-centered digital system for transparent feedback and welfare improvement.',
      },
    ],
    'Feedback Process': [
      {
        question: 'How do I submit feedback?',
        answer: 'Login to your SSFWS account, navigate to "Submit Feedback", choose a category, and write your concern or suggestion.',
      },
      {
        question: 'Can I edit my submission?',
        answer: 'Yes. You can edit or delete your submission while it is still marked as "Pending".',
      },
      {
        question: 'How will I know my feedback is being handled?',
        answer: 'You can track the progress of your submission via the "Feedback Tracker" in your dashboard.',
      },
      {
        question: 'Who receives my feedback?',
        answer: 'Feedback is automatically routed to the relevant office or student representative depending on the selected category.',
      },
    ],
    'Mental Health & Welfare': [
      {
        question: 'Can I request mental health support?',
        answer: 'Yes. Use the booking feature to schedule a counseling or clinic session anonymously or with your student ID.',
      },
      {
        question: 'What if I see a friend in distress?',
        answer: 'You can report anonymously using the Emergency or Mental Health category, and a counselor will be alerted.',
      },
      {
        question: 'Are there resources for stress and burnout?',
        answer: 'Yes. The platform offers tips, wellness blog posts, and chatbot access for basic emotional support.',
      },
      {
        question: 'Can I access the counselor outside normal hours?',
        answer: 'The chatbot is available 24/7. In-person appointments are limited to working hours but urgent cases can be fast-tracked.',
      },
    ],
    'Privacy & Security': [
      {
        question: 'Is my data safe on SSFWS?',
        answer: 'Yes. Data is encrypted and only accessible by designated officers. Anonymous feedback removes all identifiers.',
      },
      {
        question: 'Do administrators see my name?',
        answer: 'No, unless you choose to submit with your identity. Admins only see user info for non-anonymous submissions.',
      },
      {
        question: 'Can anyone else read my feedback?',
        answer: 'Only authorized personnel and student leaders involved in welfare response can access structured reports.',
      },
      {
        question: 'Can I report anonymously and still get help?',
        answer: 'Yes. Anonymous reports are taken seriously. Just provide enough detail so the right team can act on it.',
      },
    ],
  };

  const tabs = Object.keys(faqData);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {/* Hero Section */}
      <div
        className="h-64 sm:h-80 bg-cover bg-center relative flex items-center justify-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1522199755839-a2bacb67c546?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">SSFWS: Frequently Asked Questions</h1>
          <p className="text-base sm:text-lg text-gray-300">
            Learn how to engage the system, protect your privacy, and promote student welfare.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center flex-wrap gap-4 py-6 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setOpenIndex(null);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Accordion Questions */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        {faqData[activeTab].map((item, index) => (
          <div key={index} className="mb-4 border border-gray-700 rounded-xl overflow-hidden">
            <button
              className="w-full flex justify-between items-center px-4 py-3 bg-gray-800 text-left focus:outline-none"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-medium text-base sm:text-lg">{item.question}</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openIndex === index ? 'max-h-96 py-3 px-4' : 'max-h-0 px-4'
              }`}
            >
              <p className="text-sm sm:text-base text-gray-300">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
