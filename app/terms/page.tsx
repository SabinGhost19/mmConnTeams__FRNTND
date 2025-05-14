"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import Footer from "../services/chatAsistant/components/Footer";
import { useSearchParams } from "next/navigation";

const TermsOfService: React.FC = () => {
  const searchParams = useSearchParams();
  const [backPath, setBackPath] = useState("/");

  useEffect(() => {
    const from = searchParams.get("from");
    if (from === "register") {
      setBackPath("/register");
    } else {
      setBackPath("/");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link
              href={backPath}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FiArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Înapoi</span>
            </Link>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="ml-2 font-semibold text-gray-900">
                MeetingMate
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="prose prose-blue max-w-none">
          <p>
            Welcome to MeetingMate. Please read these Terms of Service ("Terms")
            carefully as they contain important information about your legal
            rights, remedies, and obligations. By accessing or using the
            MeetingMate platform, you agree to comply with and be bound by these
            Terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By registering for and/or using the MeetingMate platform in any
            manner, you agree to these Terms and all other operating rules,
            policies, and procedures that may be published by MeetingMate from
            time to time.
          </p>

          <h2>2. Changes to Terms</h2>
          <p>
            MeetingMate reserves the right, at our sole discretion, to modify or
            replace these Terms at any time. If a revision is material, we will
            provide at least 30 days' notice prior to any new terms taking
            effect. What constitutes a material change will be determined at our
            sole discretion.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To use certain features of the platform, you must register for an
            account. You must provide accurate, current, and complete
            information during the registration process and keep your account
            information up-to-date.
          </p>
          <p>
            You are responsible for safeguarding your account authentication
            credentials and for all activities that occur under your account.
            You agree to notify MeetingMate immediately of any unauthorized use
            of your account.
          </p>

          <h2>4. User Content</h2>
          <p>
            You are solely responsible for all content that you upload, post,
            email, transmit, or otherwise make available via the MeetingMate
            platform ("User Content"). You represent and warrant that:
          </p>
          <ul>
            <li>
              You either are the sole and exclusive owner of all User Content or
              you have all rights, licenses, consents, and releases necessary to
              grant MeetingMate the rights in such User Content as contemplated
              under these Terms
            </li>
            <li>
              Neither the User Content nor your posting, uploading, publication,
              submission, or transmittal of the User Content or MeetingMate's
              use of the User Content will infringe, misappropriate, or violate
              a third party's patent, copyright, trademark, trade secret, moral
              rights, or other proprietary or intellectual property rights, or
              rights of publicity or privacy, or result in the violation of any
              applicable law or regulation
            </li>
          </ul>

          <h2>5. Prohibited Activities</h2>
          <p>
            You agree not to engage in any of the following prohibited
            activities:
          </p>
          <ul>
            <li>
              Copying, distributing, or disclosing any part of the platform in
              any medium, including without limitation by any automated or
              non-automated "scraping"
            </li>
            <li>
              Using any automated system, including without limitation "robots,"
              "spiders," "offline readers," etc., to access the platform
            </li>
            <li>
              Transmitting spam, chain letters, or other unsolicited email
            </li>
            <li>
              Attempting to interfere with, compromise the system integrity or
              security, or decipher any transmissions to or from the servers
              running the platform
            </li>
            <li>
              Taking any action that imposes, or may impose at our sole
              discretion an unreasonable or disproportionately large load on our
              infrastructure
            </li>
            <li>
              Uploading invalid data, viruses, worms, or other software agents
              through the platform
            </li>
            <li>
              Collecting or harvesting any personally identifiable information
              from the platform
            </li>
            <li>Using the platform for any commercial solicitation purposes</li>
            <li>
              Impersonating another person or otherwise misrepresenting your
              affiliation with a person or entity
            </li>
            <li>Violating any applicable law or regulation</li>
          </ul>

          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your access to the platform immediately,
            without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach the Terms. Upon
            termination, your right to use the platform will immediately cease.
          </p>

          <h2>7. Disclaimer</h2>
          <p>
            The platform is provided on an "as is" and "as available" basis.
            MeetingMate expressly disclaims all warranties of any kind, whether
            express or implied, including, but not limited to, the implied
            warranties of merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall MeetingMate, its officers, directors, employees,
            or agents, be liable to you for any direct, indirect, incidental,
            special, punitive, or consequential damages whatsoever resulting
            from any errors, mistakes, or inaccuracies of content.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of the United States of America, without regard to its conflict
            of law provisions.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> legal@meetingmate.com
            <br />
            <strong>Address:</strong> 123 Tech Park, Silicon Valley, CA 94025
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
