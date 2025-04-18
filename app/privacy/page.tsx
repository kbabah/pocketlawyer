import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <p className="mb-4">
            Last updated: April 17, 2025
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Information Collection</h2>
          <p>
            At PocketLawyer, we prioritize the protection of your personal data. This policy outlines how we collect, use, 
            and safeguard your information when using our platform.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Data We Collect</h2>
          <ul className="list-disc pl-6">
            <li><strong>Personal Information:</strong> Name, email address, and contact details</li>
            <li><strong>Account Information:</strong> Login credentials and profile information</li>
            <li><strong>Legal Documents:</strong> Documents uploaded for analysis or consultation</li>
            <li><strong>Usage Information:</strong> Platform interaction data and feature usage</li>
            <li><strong>Technical Data:</strong> Device information and access logs</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">How We Use Your Information</h2>
          <ul className="list-disc pl-6">
            <li>To provide and enhance our legal services</li>
            <li>To process your transactions securely</li>
            <li>To facilitate communication with legal professionals</li>
            <li>To improve our platform and user experience</li>
            <li>To send important updates and notifications</li>
            <li>To comply with legal obligations</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Data Protection</h2>
          <p>
            We implement industry-standard security measures to protect your data. Your information is:
          </p>
          <ul className="list-disc pl-6">
            <li>Encrypted during transmission and storage</li>
            <li>Accessible only to authorized personnel</li>
            <li>Protected by secure authentication systems</li>
            <li>Regularly backed up and monitored</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Your Privacy Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="list-disc pl-6">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request data deletion</li>
            <li>Withdraw consent at any time</li>
            <li>Export your data</li>
            <li>Limit data processing</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">Contact Us</h2>
          <p>
            For privacy-related inquiries, please contact our Data Protection Officer at privacy@pocketlawyer.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}