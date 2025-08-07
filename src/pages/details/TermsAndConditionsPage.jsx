import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const TermsAndConditionsPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 font-sans bg-white shadow-xl rounded-lg my-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-8 text-green-700">Terms and Conditions</h1>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">1. Introduction</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Welcome to **Rythuri Sells Vegetables and Unprocessed Groceries**! These terms and conditions govern your use of our website and services. By accessing and using our website, you agree to comply with and be bound by the following terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">2. Products</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Rythuri offers a variety of fresh vegetables and raw groceries. All products are subject to **availability** and may vary depending on market conditions. We strive to provide the freshest produce possible.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">3. Pricing</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Prices of products are listed in **local currency**. Prices may change from time to time, and any changes will be reflected on the website. We strive to keep our pricing accurate and up-to-date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">4. Ordering and Payment</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Orders can be placed directly through our website. By placing an order, you agree to pay for the products selected at the prices indicated at the time of order confirmation.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          We accept various forms of payment including **credit/debit cards, digital payment methods**, and **Cash on Delivery (COD)**. For online orders, payment must be completed before product dispatch. COD is available for eligible regions, as indicated during checkout.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">5. Delivery</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          We provide delivery services within specific regions of Challapalli, Andhra Pradesh, India. **All deliveries are made every morning**. Delivery times may vary based on your location and product availability. While we aim to provide accurate delivery estimates, we do not guarantee exact delivery times.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">6. Returns and Refunds</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Due to the **perishable nature** of our products, returns are generally not accepted unless the product is **damaged** or **not as described**. If you receive an incorrect or damaged item, please contact us within **24 hours** of receiving your order to arrange for a refund or replacement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">7. Refund Policy</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          To understand our comprehensive refund process and eligibility criteria, please visit our dedicated{' '}
          <Link to="/refundpolicy" className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200">
            Refund Policy page
          </Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">8. Privacy Policy</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Your privacy is paramount to us. We **will not share your personal information** with third parties unless legally required. For a detailed understanding of how we collect, use, and protect your data, please refer to our{' '}
          <Link to="/privacypolicy" className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200">
            Privacy Policy
          </Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Rythuri is not liable for any indirect, incidental, or consequential damages arising from your use of the website or our products. While we strive to provide accurate product information, we do not guarantee the absolute accuracy of all information displayed.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          These Terms and Conditions are governed by the laws of India, specifically within the jurisdiction of Andhra Pradesh. Any disputes will be handled in accordance with these laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          We reserve the right to update or modify these terms and conditions at any time without prior notice. Any changes will be posted on this page, and we encourage you to check back periodically to stay informed.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          If you have any questions or concerns about these terms and conditions, please don't hesitate to reach out to us at{' '}
          <a href="mailto:rhythurishopping@proton.me" className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200">
            rhythurishopping@proton.me
          </a>.
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditionsPage;