import React from 'react';

const ContactUs = () => {
  return (
    <div className="max-w-xl mx-auto my-10 p-5 font-sans text-gray-800 leading-relaxed bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-700">📞 Contact Us</h1>

      <p className="text-lg text-center mb-6">
        For any support, queries, or feedback, feel free to reach out to us anytime at:
      </p>

      <p className="text-lg text-center">
        <strong className="font-semibold">Email:</strong>{' '}
        <a href="mailto:support@rythuri.in" className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200">
          support@rythuri.in
        </a>
      </p>
    </div>
  );
};

export default ContactUs;