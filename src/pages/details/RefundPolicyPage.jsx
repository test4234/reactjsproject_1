import React from 'react';

const RefundPolicyPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 font-sans bg-white shadow-xl rounded-lg my-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-8 text-green-700">Refund Policy</h1>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">1. Eligibility for Refund</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Refunds are only available if the product is **damaged** or **not as described** in your order. Due to the perishable nature of our products, we unfortunately cannot accept returns or offer refunds for any other reasons.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">2. Refund Process</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          If you believe your product qualifies for a refund, please contact our customer service team at{' '}
          <a href="mailto:rhythurishopping@proton.me" className="text-blue-600 hover:text-blue-800 underline font-medium">
            rhythurishopping@proton.me
          </a>{' '}
          within **24 hours** of receiving your order. To help us assess your claim, we'll ask you to provide photos or videos as proof of any damage or discrepancies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">3. Refund Method</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Approved refunds will be processed back to your **original payment method** if you paid online. For Cash on Delivery (COD) orders, we will offer a convenient **bank transfer** or **store credit**, based on your preference.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">4. Refund Timeframe</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Once your refund is approved, please allow **7-10 business days** for the process to be completed and for the funds to reflect in your account or as store credit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">5. Non-Refundable Items</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          For hygiene and safety, we cannot provide refunds for items that have been **opened or used**, unless there's a clear case of damage or incorrect delivery. Your understanding helps us ensure the quality and safety of all our products.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Should you have any questions or need further clarification regarding our Refund Policy, please don't hesitate to reach out to us at{' '}
          <a href="mailto:rhythurishopping@proton.me" className="text-blue-600 hover:text-blue-800 underline font-medium">
            rhythurishopping@proton.me
          </a>. We're here to help!
        </p>
      </section>
    </div>
  );
};

export default RefundPolicyPage;