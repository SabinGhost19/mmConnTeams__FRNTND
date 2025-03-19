import { Check, X } from "lucide-react";

const PricingPlans = () => {
  return (
    <section id="pricing" className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Flexible Pricing Plans
          </h2>
          <p className="text-xl text-gray-600">
            Scale your team's productivity with our tailored pricing options
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-white rounded-xl shadow-xl p-8 text-center border-t-4 border-blue-500 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">Starter</h3>
            <p className="text-gray-600 mb-6">
              Perfect for small teams and startups
            </p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-blue-800">$9</span>
              <span className="text-gray-600">/user/month</span>
            </div>
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Up to 5 team members
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Basic messaging
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Limited file storage
              </li>
              <li className="flex items-center text-gray-400">
                <X className="w-5 h-5 mr-2" />
                Advanced analytics
              </li>
            </ul>
            <a
              href="#"
              className="block w-full py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Professional Plan */}
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center border-t-4 border-green-500 transform hover:scale-105 transition-transform duration-300 scale-110">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-4">
              Professional
            </h3>
            <p className="text-gray-600 mb-6">
              Ideal for growing teams and businesses
            </p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-green-800">$29</span>
              <span className="text-gray-600">/user/month</span>
            </div>
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Up to 20 team members
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Advanced messaging
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Unlimited file storage
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Basic analytics
              </li>
              <li className="flex items-center text-gray-400">
                <X className="w-5 h-5 mr-2" />
                Enterprise support
              </li>
            </ul>
            <a
              href="#"
              className="block w-full py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              Choose Professional
            </a>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-xl shadow-xl p-8 text-center border-t-4 border-purple-500 transform hover:scale-105 transition-transform duration-300">
            <h3 className="text-2xl font-bold text-purple-800 mb-4">
              Enterprise
            </h3>
            <p className="text-gray-600 mb-6">
              Custom solutions for large organizations
            </p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-purple-800">Custom</span>
              <span className="text-gray-600">/pricing</span>
            </div>
            <ul className="space-y-4 mb-8 text-left">
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Unlimited team members
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Premium messaging
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Unlimited storage
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Advanced analytics
              </li>
              <li className="flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Dedicated support
              </li>
            </ul>
            <a
              href="#"
              className="block w-full py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
