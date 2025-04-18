import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DisclaimerPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Legal Disclaimer</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Legal Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <p className="mb-4">
            Last updated: April 17, 2025
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Non-Legal Advice Notice</h2>
          <p>
            Information provided through PocketLawyer is for general informational purposes only. It does not constitute legal advice 
            and should not be relied upon as such. No attorney-client relationship is created through the use of our platform or AI services.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">AI Service Limitations</h2>
          <p>
            Our AI-powered responses are based on pattern recognition and general legal information. The AI system:
          </p>
          <ul className="list-disc pl-6">
            <li>Does not provide personalized legal advice</li>
            <li>May not consider all relevant legal updates</li>
            <li>Cannot account for specific jurisdictional requirements</li>
            <li>Should not replace professional legal counsel</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Professional Services</h2>
          <p>
            Regarding our lawyer directory and consultation services:
          </p>
          <ul className="list-disc pl-6">
            <li>We do not guarantee attorney availability</li>
            <li>We do not endorse specific legal professionals</li>
            <li>We are not responsible for legal advice provided</li>
            <li>Attorney-client relationships are formed directly with lawyers</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Professional Legal Advice</h2>
          <p>
            For matters requiring legal assistance:
          </p>
          <ul className="list-disc pl-6">
            <li>Consult a qualified attorney in your jurisdiction</li>
            <li>Provide complete information about your situation</li>
            <li>Be aware of legal deadlines and limitations</li>
            <li>Do not rely solely on AI-generated information</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Jurisdiction Notice</h2>
          <p>
            Legal requirements vary significantly by location. Information provided may not apply to your jurisdiction. 
            Always verify legal requirements with local authorities or qualified legal professionals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}