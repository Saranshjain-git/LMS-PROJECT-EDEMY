import React from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <div className="flex flex-col items-center text-center gap-5 pt-16 pb-24 px-8 md:px-0">

      {/* Heading */}
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
        Learn anything, anytime, anywhere
      </h1>

      {/* Description */}
      <p className="text-gray-500 max-w-2xl text-sm md:text-base">
        Incididunt sint fugiat pariatur cupidatat consectetur sit cillum anim id
        veniam aliqua proident excepteur commodo do ea.
      </p>

      {/* CTA Buttons */}
      <div className="flex items-center font-medium gap-6 mt-6">

        {/* Get Started */}
        <Link
          to="/courses"
          className="px-10 py-3 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Get started
        </Link>

        {/* Learn More */}
        <Link
          to="/about"
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          Learn more
          <img src={assets.arrow_icon} alt="Arrow_icon" />
        </Link>

      </div>
    </div>
  );
};

export default CallToAction;
