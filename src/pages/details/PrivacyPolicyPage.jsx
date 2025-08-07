import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-3xl mx-auto my-8 p-6 sm:p-8 font-sans text-gray-800 leading-relaxed bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-green-700">🔒 Privacy Policy</h1>

      <p className="mb-4">
        <strong className="font-semibold text-gray-900">Effective Date:</strong> January 1, 2026
      </p>
      <p className="mb-6 text-lg">
        Welcome to <strong className="font-semibold text-green-600">Rythuri</strong>! Your privacy is very important to us. This policy describes how we collect, use, and protect your personal information.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">1. Information We Collect</h2>
      <ul className="list-disc list-inside ml-4 mb-6 space-y-2">
        <li>
          <strong className="font-semibold">Personal Data:</strong> Name, phone number, address, email (if provided), location, and payment info.
        </li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">2. How We Use Your Information</h2>
      <ul className="list-disc list-inside ml-4 mb-6 space-y-2">
        <li>To deliver orders and provide services</li>
        <li>To improve our website/app and user experience</li>
        <li>To process payments securely</li>
        <li>To send updates or offers (if opted in)</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">3. Data Sharing</h2>
      <p className="mb-6">
        We do <strong className="font-semibold text-red-600">not</strong> sell your data. We may share necessary information with:
      </p>
      <ul className="list-disc list-inside ml-4 mb-6 space-y-2">
        <li>Delivery partners</li>
        <li>Payment gateways</li>
        <li>Service providers (for hosting or analytics)</li>
        <li>Legal authorities, if required</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">4. Data Security</h2>
      <p className="mb-6">
        We use secure servers, encryption, and best practices to protect your data. However, no method is 100% secure.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">5. Cookies</h2>
      <p className="mb-6">
        We may use cookies to enhance your experience. You can choose to disable cookies in your browser settings if you prefer.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">6. Your Rights</h2>
      <p className="mb-4">
        You can request access, correction, or deletion of your personal information by contacting us at:
      </p>
      <p className="text-blue-600 font-bold text-center text-lg mb-6">📧 support@rythuri.in</p>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">7. Children’s Privacy</h2>
      <p className="mb-6">
        Our services are not intended for users under 13. We do not knowingly collect information from children.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">8. Changes to This Policy</h2>
      <p className="mb-6">
        We may update this Privacy Policy from time to time. Any changes will be posted on this page with the updated effective date. We encourage you to review this policy periodically.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900">9. Contact Us</h2>
      <p className="mb-4">
        For any questions or concerns about this Privacy Policy, please don't hesitate to contact us:
      </p>
      <a
        href="mailto:support@rythuri.in"
        className="text-blue-600 hover:text-blue-800 underline text-lg block text-center transition-colors duration-200"
      >
        support@rythuri.in
      </a>
    </div>
  );
};

export default PrivacyPolicy;