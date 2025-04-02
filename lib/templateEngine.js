// /lib/templateEngine.js

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Generate and download a complete project as a ZIP file
 * @param {Object} config - The user's configuration choices
 */
export async function generateProject(config) {
  const zip = new JSZip();
  
  // Add README with configuration info
  zip.file(
    "README.md", 
    generateReadme(config)
  );
  
  // Add package.json
  zip.file(
    "package.json", 
    generatePackageJson(config)
  );
  
  // Add .env.example file with all needed variables
  zip.file(
    ".env.example", 
    generateEnvExample(config)
  );
  
  // Create basic project structure
  const srcFolder = zip.folder("src");
  
  // Add app structure (differs between Next.js and Vite)
  if (config.appBackend === 'next') {
    addNextjsStructure(zip, config);
  } else {
    addViteStructure(zip, config);
  }
  
  // Add auth implementation
  addAuthImplementation(zip, config);
  
  // Add database/backend implementation
  addBackendImplementation(zip, config);
  
  // Add payment implementation
  addPaymentImplementation(zip, config);
  
  // Add AI integration
  addAIIntegration(zip, config);
  
  // Add email service integration
  addEmailIntegration(zip, config);
  
  // Add deployment configuration
  addDeploymentConfig(zip, config);
  
  // Generate and download the zip file
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "saas-starter-kit.zip");
  
  return true;
}

/**
 * Generate the README.md file with information about the project
 */
function generateReadme(config) {
  return `# SaaS Starter Kit
  
A customized SaaS starter kit with the following technology stack:

- **App Backend**: ${config.appBackend === 'next' ? 'Next.js' : 'Vite'}
- **Backend**: ${getBackendName(config.backend)}
- **ORM**: ${config.orm === 'prisma' ? 'Prisma' : 'Drizzle'}
- **File Storage**: ${getStorageName(config.fileStorage)}
- **Authentication**: ${config.authentication === 'nextauth' ? 'NextAuth.js' : 'Clerk'}
- **Payment**: ${getPaymentName(config.payment)}
- **AI Provider**: ${getAIProviderName(config.aiProvider)}
- **Email Service**: ${getEmailServiceName(config.emailService)}
- **Deployment**: ${config.deployment === 'vercel' ? 'Vercel' : 'Docker (Self-hosted)'}

## Getting Started

1. Clone this repository
2. Copy \`.env.example\` to \`.env.local\` and fill in the required environment variables
3. Run \`npm install\` to install dependencies
4. Run \`npm run dev\` to start the development server

## Project Structure

\`\`\`
/src
  /app           # Application routes (Next.js app router)
  /components    # Reusable UI components
  /lib           # Utility functions and shared code
  /services      # External service integrations
\`\`\`

## Environment Variables

See \`.env.example\` for required environment variables.

## Deployment

${config.deployment === 'vercel' 
  ? 'This project is configured for easy deployment to Vercel.' 
  : 'This project includes a Dockerfile and docker-compose.yml for self-hosting.'}
`;
}

/**
 * Generate the package.json file with dependencies based on configuration
 */
function generatePackageJson(config) {
  const dependencies = {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
  };
  
  // App backend
  if (config.appBackend === 'next') {
    dependencies["next"] = "^14.0.0";
  } else {
    dependencies["vite"] = "^4.5.0";
  }
  
  // Backend
  if (config.backend === 'supabase') {
    dependencies["@supabase/supabase-js"] = "^2.38.4";
  } else if (config.backend === 'firebase') {
    dependencies["firebase"] = "^10.5.2";
    dependencies["firebase-admin"] = "^11.11.0";
  } else if (config.backend === 'convex') {
    dependencies["convex"] = "^1.3.1";
  }
  
  // ORM
  if (config.orm === 'prisma') {
    dependencies["@prisma/client"] = "^5.5.2";
  } else if (config.orm === 'drizzle') {
    dependencies["drizzle-orm"] = "^0.28.6";
  }
  
  // File Storage (if different from backend)
  if (config.fileStorage === 's3') {
    dependencies["aws-sdk"] = "^2.1483.0";
  }
  
  // Authentication
  if (config.authentication === 'nextauth') {
    dependencies["next-auth"] = "^4.24.4";
  } else if (config.authentication === 'clerk') {
    dependencies["@clerk/nextjs"] = "^4.26.1";
  }
  
  // Payment
  if (config.payment === 'stripe') {
    dependencies["stripe"] = "^14.2.0";
  } else if (config.payment === 'razorpay') {
    dependencies["razorpay"] = "^2.9.2";
  } else if (config.payment === 'lemon') {
    dependencies["lemonsqueezy.js"] = "^1.2.0";
  }
  
  // AI Provider
  if (config.aiProvider === 'openai') {
    dependencies["openai"] = "^4.13.0";
  } else if (config.aiProvider === 'gemini') {
    dependencies["@google/generative-ai"] = "^0.1.1";
  } else if (config.aiProvider === 'deepseek') {
    dependencies["deepseek-ai"] = "^0.14.0";
  } else if (config.aiProvider === 'ollama') {
    dependencies["ollama"] = "^0.3.0";
  } else if (config.aiProvider === 'mistral') {
    dependencies["@mistralai/mistralai"] = "^0.0.7";
  }
  
  // Email Service
  if (config.emailService === 'resend') {
    dependencies["resend"] = "^2.0.0";
  } else if (config.emailService === 'sendgrid') {
    dependencies["@sendgrid/mail"] = "^7.7.0";
  } else if (config.emailService === 'mailchimp') {
    dependencies["@mailchimp/mailchimp_marketing"] = "^3.0.80";
  }
  
  // UI dependencies
  dependencies["tailwindcss"] = "^3.3.5";
  dependencies["lucide-react"] = "^0.292.0";
  
  // Dev dependencies
  const devDependencies = {
    "eslint": "^8.52.0",
    "eslint-config-next": "^14.0.0",
    "typescript": "^5.2.2",
    "@types/react": "^18.2.37",
    "@types/node": "^20.8.10",
  };
  
  if (config.orm === 'prisma') {
    devDependencies["prisma"] = "^5.5.2";
  } else if (config.orm === 'drizzle') {
    devDependencies["drizzle-kit"] = "^0.19.13";
  }
  
  // Scripts
  let scripts = {
    "dev": config.appBackend === 'next' ? "next dev" : "vite",
    "build": config.appBackend === 'next' ? "next build" : "vite build",
    "start": config.appBackend === 'next' ? "next start" : "vite preview",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  };
  
  if (config.orm === 'prisma') {
    scripts = {
      ...scripts,
      "db:push": "prisma db push",
      "db:generate": "prisma generate",
    };
  } else if (config.orm === 'drizzle') {
    scripts = {
      ...scripts,
      "db:push": "drizzle-kit push",
      "db:generate": "drizzle-kit generate",
    };
  }
  
  return JSON.stringify(
    {
      "name": "saas-starter-kit",
      "version": "0.1.0",
      "private": true,
      "scripts": scripts,
      "dependencies": dependencies,
      "devDependencies": devDependencies
    }, 
    null, 
    2
  );
}

/**
 * Generate the .env.example file with all required environment variables
 */
function generateEnvExample(config) {
  let envVars = [];
  
  // Add backend environment variables
  if (config.backend === 'supabase') {
    envVars.push('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    envVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    envVars.push('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
  } else if (config.backend === 'firebase') {
    envVars.push('NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key');
    envVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain');
    envVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id');
    envVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket');
    envVars.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id');
    envVars.push('NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id');
    envVars.push('FIREBASE_ADMIN_PRIVATE_KEY=your_firebase_admin_private_key');
    envVars.push('FIREBASE_ADMIN_CLIENT_EMAIL=your_firebase_admin_client_email');
  } else if (config.backend === 'convex') {
    envVars.push('NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url');
    envVars.push('CONVEX_DEPLOY_KEY=your_convex_deploy_key');
  }
  
  // Add file storage environment variables if different from backend
  if (config.fileStorage === 's3') {
    envVars.push('AWS_ACCESS_KEY_ID=your_aws_access_key_id');
    envVars.push('AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key');
    envVars.push('AWS_REGION=your_aws_region');
    envVars.push('AWS_S3_BUCKET_NAME=your_s3_bucket_name');
  }
  
  // Add authentication environment variables
  if (config.authentication === 'nextauth') {
    envVars.push('NEXTAUTH_SECRET=your_nextauth_secret');
    envVars.push('NEXTAUTH_URL=http://localhost:3000');
    envVars.push('# OAuth providers (add as needed)');
    envVars.push('GITHUB_ID=your_github_oauth_id');
    envVars.push('GITHUB_SECRET=your_github_oauth_secret');
    envVars.push('GOOGLE_ID=your_google_oauth_id');
    envVars.push('GOOGLE_SECRET=your_google_oauth_secret');
  } else if (config.authentication === 'clerk') {
    envVars.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key');
    envVars.push('CLERK_SECRET_KEY=your_clerk_secret_key');
  }
  
  // Add payment environment variables
  if (config.payment === 'stripe') {
    envVars.push('STRIPE_SECRET_KEY=your_stripe_secret_key');
    envVars.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key');
    envVars.push('STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret');
  } else if (config.payment === 'razorpay') {
        envVars.push('RAZORPAY_KEY_ID=your_razorpay_key_id');
        envVars.push('RAZORPAY_KEY_SECRET=your_razorpay_key_secret');
        envVars.push('RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret');
      } else if (config.payment === 'lemon') {
        envVars.push('LEMON_SQUEEZY_API_KEY=your_lemon_squeezy_api_key');
        envVars.push('LEMON_SQUEEZY_WEBHOOK_SECRET=your_lemon_squeezy_webhook_secret');
        envVars.push('LEMON_SQUEEZY_STORE_ID=your_lemon_squeezy_store_id');
      }
      
      // Add AI provider environment variables
      if (config.aiProvider === 'openai') {
        envVars.push('OPENAI_API_KEY=your_openai_api_key');
      } else if (config.aiProvider === 'gemini') {
        envVars.push('GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key');
      } else if (config.aiProvider === 'deepseek') {
        envVars.push('DEEPSEEK_API_KEY=your_deepseek_api_key');
      } else if (config.aiProvider === 'ollama') {
        envVars.push('OLLAMA_HOST=http://localhost:11434');
      } else if (config.aiProvider === 'mistral') {
        envVars.push('MISTRAL_API_KEY=your_mistral_api_key');
      }
      
      // Add email service environment variables
      if (config.emailService === 'resend') {
        envVars.push('RESEND_API_KEY=your_resend_api_key');
        envVars.push('EMAIL_FROM=no-reply@yourdomain.com');
      } else if (config.emailService === 'sendgrid') {
        envVars.push('SENDGRID_API_KEY=your_sendgrid_api_key');
        envVars.push('EMAIL_FROM=no-reply@yourdomain.com');
      } else if (config.emailService === 'mailchimp') {
        envVars.push('MAILCHIMP_API_KEY=your_mailchimp_api_key');
        envVars.push('MAILCHIMP_SERVER_PREFIX=us1');
        envVars.push('EMAIL_FROM=no-reply@yourdomain.com');
      }
      
      // Add database URL if using Prisma/Drizzle
      if (config.orm === 'prisma' || config.orm === 'drizzle') {
        envVars.push('DATABASE_URL=your_database_connection_string');
      }
      
      // Add app URL and name
      envVars.push('NEXT_PUBLIC_APP_URL=http://localhost:3000');
      envVars.push('NEXT_PUBLIC_APP_NAME=SaaS Starter');
      
      return envVars.join('\n');
    }
    
    /**
     * Add the basic structure for a Next.js project
     */
    function addNextjsStructure(zip, config) {
      // Create app directory structure
      const appDir = zip.folder("app");
      
      // Add main layout
      appDir.file(
        "layout.tsx", 
        `import "./globals.css";
    import { Inter } from "next/font/google";
    ${config.authentication === 'clerk' ? 'import { ClerkProvider } from "@clerk/nextjs";' : ''}
    
    const inter = Inter({ subsets: ["latin"] });
    
    export const metadata = {
      title: "SaaS Starter Kit",
      description: "A customized SaaS starter kit",
    };
    
    export default function RootLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <html lang="en">
          ${config.authentication === 'clerk' ? 
            '<ClerkProvider>\n      <body className={inter.className}>{children}</body>\n    </ClerkProvider>' : 
            '<body className={inter.className}>{children}</body>'}
        </html>
      );
    }`
      );
      
      // Add global CSS
      appDir.file(
        "globals.css", 
        `@tailwind base;
    @tailwind components;
    @tailwind utilities;
    
    :root {
      --foreground-rgb: 0, 0, 0;
      --background-start-rgb: 214, 219, 220;
      --background-end-rgb: 255, 255, 255;
    }
    
    body {
      color: rgb(var(--foreground-rgb));
      background: white;
    }`
      );
      
      // Add home page
      appDir.file(
        "page.tsx", 
        `import Link from "next/link";
    ${config.authentication === 'nextauth' ? 'import { getServerSession } from "next-auth/next";' : 
      config.authentication === 'clerk' ? 'import { auth } from "@clerk/nextjs";' : ''}
    
    export default async function Home() {
      ${config.authentication === 'nextauth' ? 'const session = await getServerSession();' : 
        config.authentication === 'clerk' ? 'const { userId } = auth();' : ''}
      
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
            <h1 className="text-4xl font-bold mb-6 text-center">Welcome to SaaS Starter Kit</h1>
            <p className="text-center mb-6">
              A customized starter kit for your SaaS application.
            </p>
            
            <div className="flex justify-center mt-8">
              ${config.authentication === 'nextauth' ? 
                'session ? <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md mr-4">Dashboard</Link> : <Link href="/api/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded-md mr-4">Sign In</Link>' : 
                config.authentication === 'clerk' ? 
                'userId ? <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md mr-4">Dashboard</Link> : <Link href="/sign-in" className="px-4 py-2 bg-blue-600 text-white rounded-md mr-4">Sign In</Link>' :
                '<Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md mr-4">Dashboard</Link>'}
              <Link href="/pricing" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">
                View Pricing
              </Link>
            </div>
          </div>
        </main>
      );
    }`
      );
      
      // Add dashboard page
      const dashboardDir = zip.folder("app/dashboard");
      dashboardDir.file(
        "page.tsx", 
        `${config.authentication === 'nextauth' ? 
          'import { getServerSession } from "next-auth/next";\nimport { redirect } from "next/navigation";' : 
          config.authentication === 'clerk' ? 
          'import { auth } from "@clerk/nextjs";\nimport { redirect } from "next/navigation";' : 
          ''}
    
    export default async function Dashboard() {
      ${config.authentication === 'nextauth' ? 
        'const session = await getServerSession();\n\n  if (!session) {\n    redirect("/api/auth/signin");\n  }' : 
        config.authentication === 'clerk' ? 
        'const { userId } = auth();\n\n  if (!userId) {\n    redirect("/sign-in");\n  }' : 
        ''}
      
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium mb-2">Total Users</h2>
              <p className="text-3xl font-bold">128</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium mb-2">Active Subscriptions</h2>
              <p className="text-3xl font-bold">85</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium mb-2">Monthly Revenue</h2>
              <p className="text-3xl font-bold">$4,250</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="font-medium">New subscription</p>
                <p className="text-sm text-gray-500">User123 subscribed to Pro plan</p>
              </div>
              <div className="border-b pb-2">
                <p className="font-medium">Payment processed</p>
                <p className="text-sm text-gray-500">$49.00 payment received</p>
              </div>
              <div className="border-b pb-2">
                <p className="font-medium">New user registered</p>
                <p className="text-sm text-gray-500">User456 joined the platform</p>
              </div>
            </div>
          </div>
        </div>
      );
    }`
      );
      
      // Add pricing page
      const pricingDir = zip.folder("app/pricing");
      pricingDir.file(
        "page.tsx", 
        `import Link from "next/link";
    ${config.authentication === 'nextauth' ? 'import { getServerSession } from "next-auth/next";' : 
      config.authentication === 'clerk' ? 'import { auth } from "@clerk/nextjs";' : ''}
    
    export default async function Pricing() {
      ${config.authentication === 'nextauth' ? 'const session = await getServerSession();' : 
        config.authentication === 'clerk' ? 'const { userId } = auth();' : ''}
      
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="sm:flex sm:flex-col sm:align-center mb-12">
            <h1 className="text-5xl font-extrabold text-center">Pricing Plans</h1>
            <p className="mt-5 text-xl text-gray-500 text-center">
              Start building for free, then add a plan to go live
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="border border-gray-200 rounded-lg shadow-sm p-8 bg-white">
              <h2 className="text-xl font-medium">Free</h2>
              <p className="mt-4 text-gray-500">Perfect for trying out our service</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Up to 1,000 API calls</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Basic features</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Community support</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link href="/api/auth/signin" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center">
                  Get Started
                </Link>
              </div>
            </div>
            
            {/* Pro Tier */}
            <div className="border border-blue-200 rounded-lg shadow-sm p-8 bg-white relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <h2 className="text-xl font-medium">Pro</h2>
              <p className="mt-4 text-gray-500">Perfect for small businesses</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold">$49</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Up to 10,000 API calls</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">All basic features</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Priority support</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link href="/api/checkout/pro" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center">
                  Upgrade Now
                </Link>
              </div>
            </div>
            
            {/* Enterprise Tier */}
            <div className="border border-gray-200 rounded-lg shadow-sm p-8 bg-white">
              <h2 className="text-xl font-medium">Enterprise</h2>
              <p className="mt-4 text-gray-500">Dedicated support & infrastructure</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold">$199</span>
                <span className="text-base font-medium text-gray-500">/mo</span>
              </p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Unlimited API calls</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">All pro features</span>
                </li>
                <li className="flex">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3">Dedicated support</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <Link href="/api/checkout/enterprise" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md text-center">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }`
      );
      
      // Add components directory
      const componentsDir = zip.folder("components");
      
      // Create a basic layout component
      componentsDir.file(
        "layout/Header.tsx",
        `import Link from "next/link";
    ${config.authentication === 'nextauth' ? 'import { getServerSession } from "next-auth/next";\nimport { signOut } from "next-auth/react";' : 
      config.authentication === 'clerk' ? 'import { UserButton } from "@clerk/nextjs";' : ''}
    
    export default async function Header() {
      ${config.authentication === 'nextauth' ? 'const session = await getServerSession();' : ''}
      
      return (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              SaaS Starter
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              
              ${config.authentication === 'nextauth' ? 
                'session ? (<>\n            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>\n            <button onClick={() => signOut()} className="text-gray-600 hover:text-gray-900">Sign Out</button>\n          </>) : (\n            <Link href="/api/auth/signin" className="text-gray-600 hover:text-gray-900">Sign In</Link>\n          )' : 
                config.authentication === 'clerk' ? 
                '<UserButton afterSignOutUrl="/" />' : 
                '<Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>'}
            </nav>
          </div>
        </header>
      );
    }`
      );
      
      // Create lib directory
      const libDir = zip.folder("lib");
      
      // Add database client based on ORM
      if (config.orm === 'prisma') {
        libDir.file(
          "prisma.ts",
          `import { PrismaClient } from '@prisma/client';
    
    let prisma: PrismaClient;
    
    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient();
    } else {
      // Prevent multiple instances of Prisma Client in development
      if (!global.prisma) {
        global.prisma = new PrismaClient();
      }
      prisma = global.prisma;
    }
    
    export default prisma;`
        );
        
        // Add prisma schema
        zip.file(
          "prisma/schema.prisma",
          `// This is your Prisma schema file,
    // learn more about it in the docs: https://pris.ly/d/prisma-schema
    
    generator client {
      provider = "prisma-client-js"
    }
    
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    
    model User {
      id            String    @id @default(cuid())
      name          String?
      email         String?   @unique
      emailVerified DateTime?
      image         String?
      createdAt     DateTime  @default(now())
      updatedAt     DateTime  @updatedAt
      
      // For auth
      accounts      Account[]
      sessions      Session[]
      
      // For subscriptions
      subscription  Subscription?
    }
    
    model Account {
      id                 String  @id @default(cuid())
      userId             String
      type               String
      provider           String
      providerAccountId  String
      refresh_token      String?  @db.Text
      access_token       String?  @db.Text
      expires_at         Int?
      token_type         String?
      scope              String?
      id_token           String?  @db.Text
      session_state      String?
    
      user User @relation(fields: [userId], references: [id], onDelete: Cascade)
    
      @@unique([provider, providerAccountId])
    }
    
    model Session {
      id           String   @id @default(cuid())
      sessionToken String   @unique
      userId       String
      expires      DateTime
      user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    }
    
    model VerificationToken {
      identifier String
      token      String   @unique
      expires    DateTime
    
      @@unique([identifier, token])
    }
    
    model Subscription {
      id              String   @id @default(cuid())
      userId          String   @unique
      status          String   // active, canceled, past_due, etc.
      priceId         String?
      quantity        Int?
      cancelAtPeriodEnd Boolean @default(false)
      createdAt       DateTime @default(now())
      currentPeriodStart DateTime
      currentPeriodEnd  DateTime
      endedAt         DateTime?
      cancelAt        DateTime?
      
      user User @relation(fields: [userId], references: [id], onDelete: Cascade)
    }`
        );
      } else if (config.orm === 'drizzle') {
        libDir.file(
          "db.ts",
          `import { drizzle } from 'drizzle-orm/node-postgres';
    import { Pool } from 'pg';
    import * as schema from './schema';
    
    // Create a PostgreSQL connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Create the Drizzle database connection
    export const db = drizzle(pool, { schema });`
        );
        
        // Add schema file
        libDir.file(
          "schema.ts",
          `import { pgTable, serial, text, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
    
    export const users = pgTable('users', {
      id: serial('id').primaryKey(),
      name: text('name'),
      email: varchar('email', { length: 255 }).unique(),
      emailVerified: timestamp('email_verified'),
      image: text('image'),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at')
    });
    
    export const accounts = pgTable('accounts', {
      id: serial('id').primaryKey(),
      userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
      type: varchar('type', { length: 255 }),
      provider: varchar('provider', { length: 255 }),
      providerAccountId: varchar('provider_account_id', { length: 255 }),
      refreshToken: text('refresh_token'),
      accessToken: text('access_token'),
      expiresAt: integer('expires_at'),
      tokenType: varchar('token_type', { length: 255 }),
      scope: varchar('scope', { length: 255 }),
      idToken: text('id_token'),
      sessionState: varchar('session_state', { length: 255 })
    });
    
    export const sessions = pgTable('sessions', {
      id: serial('id').primaryKey(),
      sessionToken: varchar('session_token', { length: 255 }).unique(),
      userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
      expires: timestamp('expires')
    });
    
    export const verificationTokens = pgTable('verification_tokens', {
      identifier: varchar('identifier', { length: 255 }),
      token: varchar('token', { length: 255 }).unique(),
      expires: timestamp('expires')
    });
    
    export const subscriptions = pgTable('subscriptions', {
      id: serial('id').primaryKey(),
      userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).unique(),
      status: varchar('status', { length: 255 }),
      priceId: varchar('price_id', { length: 255 }),
      quantity: integer('quantity'),
      cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
      createdAt: timestamp('created_at').defaultNow(),
      currentPeriodStart: timestamp('current_period_start'),
      currentPeriodEnd: timestamp('current_period_end'),
      endedAt: timestamp('ended_at'),
      cancelAt: timestamp('cancel_at')
    });`
        );
      }
      
      // Add Next.js configuration based on selected technologies
      const nextConfigContent = getNextConfigContent(config);
      zip.file("next.config.js", nextConfigContent);
      
      // Add tailwind config
      zip.file(
        "tailwind.config.js",
        `/** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {},
      },
      plugins: [],
    }`
      );
    }
    
    /**
     * Generate next.config.js content based on configuration
     */
    function getNextConfigContent(config) {
      let content = `/** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,`;
      
      // Add redirects for authentication if using Clerk
      if (config.authentication === 'clerk') {
        content += `
      async redirects() {
        return [
          {
            source: '/sign-in',
            destination: '/api/auth/signin',
            permanent: true,
          },
          {
            source: '/sign-up',
            destination: '/api/auth/signup',
            permanent: true,
          },
        ];
      },`;
      }
      
      // Add image domains if needed
      const imageDomains = [];
      
      if (config.fileStorage === 'supabase') {
        imageDomains.push('{projectRef}.supabase.co');
      }
      
      if (config.fileStorage === 'firebase') {
        imageDomains.push('firebasestorage.googleapis.com');
      }
      
      if (config.fileStorage === 's3') {
        imageDomains.push('s3.amazonaws.com');
      }
      
      if (imageDomains.length > 0) {
        content += `
      images: {
        domains: [${imageDomains.map(domain => `'${domain}'`).join(', ')}],
      },`;
      }
      
      content += `
      transpilePackages: [],
    };
    
    module.exports = nextConfig;`;
    
      return content;
    }
    
    /**
     * Add the structure for a Vite project
     */
    function addViteStructure(zip, config) {
      // Create src directory structure
      const srcDir = zip.folder("src");
      
      // Add App.jsx
      srcDir.file(
        "App.jsx",
        `import { useState } from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import Home from './pages/Home';
    import Dashboard from './pages/Dashboard';
    import Pricing from './pages/Pricing';
    import NotFound from './pages/NotFound';
    ${config.authentication === 'clerk' ? "import { ClerkProvider, SignIn, SignUp } from '@clerk/clerk-react';" : ""}
    
    function App() {
      return (
        ${config.authentication === 'clerk' ? 
          "<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>\n      <Router>\n        <Routes>\n          <Route path=\"/\" element={<Home />} />\n          <Route path=\"/dashboard\" element={<Dashboard />} />\n          <Route path=\"/pricing\" element={<Pricing />} />\n          <Route path=\"/sign-in\" element={<SignIn />} />\n          <Route path=\"/sign-up\" element={<SignUp />} />\n          <Route path=\"*\" element={<NotFound />} />\n        </Routes>\n      </Router>\n    </ClerkProvider>" : 
          "<Router>\n      <Routes>\n        <Route path=\"/\" element={<Home />} />\n        <Route path=\"/dashboard\" element={<Dashboard />} />\n        <Route path=\"/pricing\" element={<Pricing />} />\n        <Route path=\"*\" element={<NotFound />} />\n      </Routes>\n    </Router>"}
      );
    }
    
    export default App;`
      );
      
      // Add main.jsx
      srcDir.file(
        "main.jsx",
        `import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import './index.css';
    
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );`
      );
      
      // Add index.css
      srcDir.file(
        "index.css",
        `@tailwind base;
    @tailwind components;
    @