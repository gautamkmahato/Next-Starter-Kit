'use client'


import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Download, Eye } from 'lucide-react';

const ConfigurationForm = () => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    appBackend: 'next',
    backend: 'supabase',
    orm: 'prisma',
    fileStorage: 'supabase',
    authentication: 'nextauth',
    payment: 'stripe',
    aiProvider: 'openai',
    emailService: 'resend',
    deployment: 'vercel'
  });

  const totalSteps = 9;

  const updateConfig = (section, value) => {
    setConfig(prev => ({ ...prev, [section]: value }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">App Backend</h2>
            <p className="text-gray-600">Select the framework for your application</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="appBackend"
                  value="next"
                  checked={config.appBackend === 'next'}
                  onChange={() => updateConfig('appBackend', 'next')}
                  className="h-4 w-4"
                />
                <span>Next.js</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="appBackend"
                  value="vite"
                  checked={config.appBackend === 'vite'}
                  onChange={() => updateConfig('appBackend', 'vite')}
                  className="h-4 w-4"
                />
                <span>Vite</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Backend</h2>
            <p className="text-gray-600">Select your backend service</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="backend"
                  value="supabase"
                  checked={config.backend === 'supabase'}
                  onChange={() => updateConfig('backend', 'supabase')}
                  className="h-4 w-4"
                />
                <span>Supabase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="backend"
                  value="firebase"
                  checked={config.backend === 'firebase'}
                  onChange={() => updateConfig('backend', 'firebase')}
                  className="h-4 w-4"
                />
                <span>Firebase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="backend"
                  value="convex"
                  checked={config.backend === 'convex'}
                  onChange={() => updateConfig('backend', 'convex')}
                  className="h-4 w-4"
                />
                <span>Convex</span>
              </label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">ORM</h2>
            <p className="text-gray-600">Select your database ORM</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="orm"
                  value="prisma"
                  checked={config.orm === 'prisma'}
                  onChange={() => updateConfig('orm', 'prisma')}
                  className="h-4 w-4"
                />
                <span>Prisma</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="orm"
                  value="drizzle"
                  checked={config.orm === 'drizzle'}
                  onChange={() => updateConfig('orm', 'drizzle')}
                  className="h-4 w-4"
                />
                <span>Drizzle</span>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">File Storage</h2>
            <p className="text-gray-600">Select your file storage solution</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="fileStorage"
                  value="supabase"
                  checked={config.fileStorage === 'supabase'}
                  onChange={() => updateConfig('fileStorage', 'supabase')}
                  className="h-4 w-4"
                />
                <span>Supabase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="fileStorage"
                  value="firebase"
                  checked={config.fileStorage === 'firebase'}
                  onChange={() => updateConfig('fileStorage', 'firebase')}
                  className="h-4 w-4"
                />
                <span>Firebase</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="fileStorage"
                  value="convex"
                  checked={config.fileStorage === 'convex'}
                  onChange={() => updateConfig('fileStorage', 'convex')}
                  className="h-4 w-4"
                />
                <span>Convex</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="fileStorage"
                  value="s3"
                  checked={config.fileStorage === 's3'}
                  onChange={() => updateConfig('fileStorage', 's3')}
                  className="h-4 w-4"
                />
                <span>AWS S3</span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Authentication</h2>
            <p className="text-gray-600">Select your authentication provider</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="authentication"
                  value="nextauth"
                  checked={config.authentication === 'nextauth'}
                  onChange={() => updateConfig('authentication', 'nextauth')}
                  className="h-4 w-4"
                />
                <span>NextAuth</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="authentication"
                  value="clerk"
                  checked={config.authentication === 'clerk'}
                  onChange={() => updateConfig('authentication', 'clerk')}
                  className="h-4 w-4"
                />
                <span>Clerk</span>
              </label>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Payment</h2>
            <p className="text-gray-600">Select your payment processor</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  checked={config.payment === 'stripe'}
                  onChange={() => updateConfig('payment', 'stripe')}
                  className="h-4 w-4"
                />
                <span>Stripe</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={config.payment === 'razorpay'}
                  onChange={() => updateConfig('payment', 'razorpay')}
                  className="h-4 w-4"
                />
                <span>Razorpay</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="payment"
                  value="lemon"
                  checked={config.payment === 'lemon'}
                  onChange={() => updateConfig('payment', 'lemon')}
                  className="h-4 w-4"
                />
                <span>Lemon Squeezy</span>
              </label>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">AI Provider</h2>
            <p className="text-gray-600">Select your AI provider</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="aiProvider"
                  value="openai"
                  checked={config.aiProvider === 'openai'}
                  onChange={() => updateConfig('aiProvider', 'openai')}
                  className="h-4 w-4"
                />
                <span>OpenAI</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="aiProvider"
                  value="gemini"
                  checked={config.aiProvider === 'gemini'}
                  onChange={() => updateConfig('aiProvider', 'gemini')}
                  className="h-4 w-4"
                />
                <span>Google Gemini AI</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="aiProvider"
                  value="deepseek"
                  checked={config.aiProvider === 'deepseek'}
                  onChange={() => updateConfig('aiProvider', 'deepseek')}
                  className="h-4 w-4"
                />
                <span>Deepseek AI</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="aiProvider"
                  value="ollama"
                  checked={config.aiProvider === 'ollama'}
                  onChange={() => updateConfig('aiProvider', 'ollama')}
                  className="h-4 w-4"
                />
                <span>Ollama</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="aiProvider"
                  value="mistral"
                  checked={config.aiProvider === 'mistral'}
                  onChange={() => updateConfig('aiProvider', 'mistral')}
                  className="h-4 w-4"
                />
                <span>Mistral AI</span>
              </label>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Email Service</h2>
            <p className="text-gray-600">Select your email service provider</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="emailService"
                  value="resend"
                  checked={config.emailService === 'resend'}
                  onChange={() => updateConfig('emailService', 'resend')}
                  className="h-4 w-4"
                />
                <span>Resend</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="emailService"
                  value="sendgrid"
                  checked={config.emailService === 'sendgrid'}
                  onChange={() => updateConfig('emailService', 'sendgrid')}
                  className="h-4 w-4"
                />
                <span>SendGrid</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="emailService"
                  value="mailchimp"
                  checked={config.emailService === 'mailchimp'}
                  onChange={() => updateConfig('emailService', 'mailchimp')}
                  className="h-4 w-4"
                />
                <span>MailChimp</span>
              </label>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Deployment</h2>
            <p className="text-gray-600">Select your deployment platform</p>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deployment"
                  value="vercel"
                  checked={config.deployment === 'vercel'}
                  onChange={() => updateConfig('deployment', 'vercel')}
                  className="h-4 w-4"
                />
                <span>Vercel</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deployment"
                  value="docker"
                  checked={config.deployment === 'docker'}
                  onChange={() => updateConfig('deployment', 'docker')}
                  className="h-4 w-4"
                />
                <span>Docker (Self-host)</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">SaaS Starter Kit Generator</h1>
        <div className="w-full bg-gray-200 h-2 mt-4 rounded-full">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
        <p className="text-center mt-2 text-sm text-gray-600">
          Step {step} of {totalSteps}
        </p>
      </div>

      {renderStep()}

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`flex items-center px-4 py-2 rounded ${
            step === 1
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </button>

        {step < totalSteps ? (
          <button
            onClick={nextStep}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              <Eye className="h-4 w-4 mr-1" /> Preview
            </button>
            <button
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-1" /> Generate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationForm;