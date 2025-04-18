import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Terms and Conditions</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <p className="mb-4">
            Last updated: April 17, 2025
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Overview</h2>
          <p>
            By using PocketLawyer, you agree to these Terms of Service, our Privacy Policy, and Legal Disclaimer. 
            Please read these documents carefully before using our services.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Service Description</h2>
          <p>
            PocketLawyer provides:
          </p>
          <ul className="list-disc pl-6">
            <li>AI-powered legal information assistance</li>
            <li>Document analysis and guidance</li>
            <li>Access to qualified legal professionals</li>
            <li>Secure communication channels for legal consultations</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Account Responsibilities</h2>
          <p>
            When creating an account, you must:
          </p>
          <ul className="list-disc pl-6">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your login credentials</li>
            <li>Take responsibility for all account activity</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Professional Conduct</h2>
          <p>
            For legal professionals on our platform:
          </p>
          <ul className="list-disc pl-6">
            <li>Maintain active licensure in your jurisdiction</li>
            <li>Provide accurate credentials and experience</li>
            <li>Comply with professional ethics rules</li>
            <li>Maintain client confidentiality</li>
            <li>Set clear consultation terms</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Client Understanding</h2>
          <p>
            Users seeking legal services acknowledge:
          </p>
          <ul className="list-disc pl-6">
            <li>Attorney availability varies by jurisdiction</li>
            <li>PocketLawyer is not a law firm</li>
            <li>Direct attorney-client relationships are formed with consulting lawyers</li>
            <li>Consultation fees are set by individual attorneys</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Service Limitations</h2>
          <p>
            Please note:
          </p>
          <ul className="list-disc pl-6">
            <li>Our AI provides general legal information only</li>
            <li>Services are not a substitute for professional legal advice</li>
            <li>Platform availability may vary</li>
            <li>We reserve the right to modify or suspend services</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Contact Information</h2>
          <p>
            For questions about these terms, please contact us at legal@pocketlawyer.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}