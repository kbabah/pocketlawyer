import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Terms and Conditions</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>TERMS OF SERVICE</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <p className="mb-4">
            Last updated: April 17, 2025
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">1. ACCEPTANCE OF TERMS</h2>
          <p>
            By accessing or using Pocket Lawyer, you agree to be bound by these Terms and Conditions, our Privacy Policy, 
            and our Disclaimer. If you do not agree to all of these terms, you may not use our services.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">2. CHANGES TO TERMS</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting 
            on the platform. Your continued use of Pocket Lawyer after any changes constitutes your acceptance of the 
            new Terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">3. DESCRIPTION OF SERVICES</h2>
          <p>
            Pocket Lawyer provides:
          </p>
          <ul className="list-disc pl-6">
            <li>AI-powered legal information and document analysis</li>
            <li>A directory of legal professionals</li>
            <li>Communication tools to facilitate consultations with legal professionals</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">4. USER ACCOUNTS</h2>
          <p>
            To access certain features, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-6">
            <li>Maintaining the confidentiality of your account information</li>
            <li>All activities that occur under your account</li>
            <li>Providing accurate and complete information</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">5. USER CONDUCT</h2>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-6">
            <li>Use our services for illegal purposes</li>
            <li>Submit false or misleading information</li>
            <li>Impersonate any person or entity</li>
            <li>Interfere with the proper functioning of the platform</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Harass, abuse, or harm others</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">6. LAWYER PROFILES AND CONSULTATIONS</h2>
          <p>
            For legal professionals creating profiles on our platform:
          </p>
          <ul className="list-disc pl-6">
            <li>You must be a licensed attorney in good standing in your jurisdiction</li>
            <li>You must provide accurate information about your credentials and experience</li>
            <li>You are solely responsible for compliance with the professional rules of conduct in your jurisdiction</li>
            <li>Any attorney-client relationship is formed directly between you and the user, not with Pocket Lawyer</li>
          </ul>
          <p>
            For users seeking legal consultations:
          </p>
          <ul className="list-disc pl-6">
            <li>We do not guarantee the availability of attorneys in your jurisdiction</li>
            <li>We are not responsible for the quality or accuracy of legal advice provided</li>
            <li>Payment terms for consultations are between you and the attorney</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">7. INTELLECTUAL PROPERTY</h2>
          <p>
            All content on Pocket Lawyer, including text, graphics, logos, and software, is our property 
            or the property of our licensors and is protected by copyright and other intellectual property laws.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">8. DISCLAIMER OF WARRANTIES</h2>
          <p>
            OUR SERVICES ARE PROVIDED "AS IS" WITHOUT ANY WARRANTIES, EXPRESS OR IMPLIED.
            WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">9. LIMITATION OF LIABILITY</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
            SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">10. INDEMNIFICATION</h2>
          <p>
            You agree to indemnify and hold us harmless from any claims, damages, liabilities, costs, 
            or expenses arising from your use of our services or your violation of these Terms.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">11. GOVERNING LAW</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
            without regard to its conflict of law principles.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">12. DISPUTE RESOLUTION</h2>
          <p>
            Any dispute arising from these Terms shall be resolved through binding arbitration in accordance 
            with the rules of [Arbitration Association] in [Your Jurisdiction].
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">13. TERMINATION</h2>
          <p>
            We reserve the right to terminate or suspend your account and access to our services at any time, 
            without notice, for any reason.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">14. CONTACT INFORMATION</h2>
          <p>
            If you have any questions about these Terms, please contact us at [Your Contact Email].
          </p>
        </CardContent>
      </Card>
    </div>
  );
}