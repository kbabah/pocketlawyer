import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>PRIVACY POLICY</CardTitle>
        </CardHeader>
        <CardContent className="prose">
          <p className="mb-4">
            Last updated: April 17, 2025
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">1. INTRODUCTION</h2>
          <p>
            At Pocket Lawyer, we respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
            you use our platform.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">2. INFORMATION WE COLLECT</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and payment information.</li>
            <li><strong>Account Information:</strong> Username, password, and profile details.</li>
            <li><strong>Legal Documents:</strong> Any documents you upload for analysis or share during consultations.</li>
            <li><strong>Usage Data:</strong> How you interact with our platform, features used, and time spent.</li>
            <li><strong>Device Information:</strong> IP address, browser type, device type, and operating system.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">3. HOW WE USE YOUR INFORMATION</h2>
          <p>
            We use your information for the following purposes:
          </p>
          <ul className="list-disc pl-6">
            <li>To provide and maintain our services</li>
            <li>To process and complete transactions</li>
            <li>To facilitate communications between you and legal professionals</li>
            <li>To improve and personalize user experience</li>
            <li>To develop new products, services, and features</li>
            <li>To communicate with you about updates, security alerts, and support</li>
            <li>To prevent fraud and abuse of our platform</li>
            <li>To comply with legal obligations</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">4. INFORMATION SHARING AND DISCLOSURE</h2>
          <p>
            We may share your information with:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>Legal Professionals:</strong> When you initiate a consultation or request to connect with an attorney.</li>
            <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (payment processing, data analysis, email delivery).</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulations.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">5. DATA SECURITY</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data 
            against unauthorized access, alteration, disclosure, or destruction. However, no method of 
            transmission over the Internet or electronic storage is 100% secure.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">6. DATA RETENTION</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the purposes outlined 
            in this Privacy Policy, unless a longer retention period is required by law.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">7. LEGAL DOCUMENT HANDLING</h2>
          <p>
            Documents you upload or share for analysis or during consultations:
          </p>
          <ul className="list-disc pl-6">
            <li>Are encrypted in transit and at rest</li>
            <li>Are accessible only by you and any legal professional you explicitly share them with</li>
            <li>May be analyzed by our automated systems to provide our services</li>
            <li>Will not be shared with third parties except as described in this policy</li>
            <li>Can be deleted at your request, subject to legal retention requirements</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">8. YOUR RIGHTS</h2>
          <p>
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-6">
            <li>Access and receive a copy of your data</li>
            <li>Rectify inaccurate or incomplete information</li>
            <li>Request deletion of your personal data</li>
            <li>Restrict or object to processing of your data</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">9. CHILDREN'S PRIVACY</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect 
            personal information from children under 18. If we become aware that we have collected personal 
            data from a child without verification of parental consent, we will take steps to remove that information.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">10. INTERNATIONAL DATA TRANSFERS</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. 
            These countries may have different data protection laws. We will take appropriate safeguards to ensure 
            your data is protected.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">11. CHANGES TO THIS PRIVACY POLICY</h2>
          <p>
            We may update this Privacy Policy from time to time. The updated version will be indicated by an 
            updated "Last updated" date. We encourage you to review this Privacy Policy periodically.
          </p>
          
          <h2 className="text-xl font-semibold mt-4 mb-2">12. CONTACT US</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at [Your Contact Email].
          </p>
        </CardContent>
      </Card>
    </div>
  );
}