import React from 'react';
import { Link } from 'react-router-dom';
// No need to import './Footer.css' anymore

const Footer = () => {
  return (
    <footer
      className="
        bg-[rgb(23,52,23)] /* background-color */
        text-white /* color */
        py-[20px] /* padding */
        text-center /* text-align */
        font-sans /* font-family */
      "
    >
      <div
        className="
          max-w-[1200px] /* max-width */
          mx-auto /* margin */
        "
      >
        <ul
          className="
            list-none /* list-style */
            p-0 /* padding */
            mb-[10px] /* margin-bottom */
            flex /* display */
            justify-center /* justify-content */
            flex-wrap /* flex-wrap */
            gap-[15px] /* gap */
          "
        >
          <li>
            <Link
              to="/termsandcondtions"
              className="
                text-[#aaa] /* color */
                no-underline /* text-decoration */
                transition-colors duration-300 ease-in-out /* transition */
                hover:text-white /* hover color */
              "
            >
              Terms and Conditions
            </Link>
          </li>
          <li>
            <Link
              to="/refundpolicy"
              className="
                text-[#aaa] /* color */
                no-underline /* text-decoration */
                transition-colors duration-300 ease-in-out /* transition */
                hover:text-white /* hover color */
              "
            >
              Refund Policy
            </Link>
          </li>
          <li>
            <Link
              to="/contactus"
              className="
                text-[#aaa] /* color */
                no-underline /* text-decoration */
                transition-colors duration-300 ease-in-out /* transition */
                hover:text-white /* hover color */
              "
            >
              Contact Us
            </Link>
          </li>
          <li>
            <Link
              to="/privacypolicy"
              className="
                text-[#aaa] /* color */
                no-underline /* text-decoration */
                transition-colors duration-300 ease-in-out /* transition */
                hover:text-white /* hover color */
              "
            >
              Privacy Policy
            </Link>
          </li>
        </ul>
        <p
          className="
            text-[14px] /* font-size */
            text-[#777] /* color */
          "
        >
          &copy; {new Date().getFullYear()} <strong>Rythuri</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;