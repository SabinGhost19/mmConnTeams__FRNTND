"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiShield,
  FiLock,
  FiUsers,
  FiInfo,
  FiClock,
  FiGlobe,
  FiMail,
} from "react-icons/fi";
import Footer from "../services/chatAsistant/components/Footer";
import { useSearchParams } from "next/navigation";

const PrivacyPolicy: React.FC = () => {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link
              href={backPath}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <FiArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Înapoi</span>
            </Link>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="ml-2 font-semibold text-gray-900">
                MeetingMate
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-center py-12 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Politica de Confidențialitate
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            Protejăm informațiile dvs. personale și vă respectăm dreptul la
            confidențialitate
          </p>
          <div className="flex justify-center mt-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-400 bg-opacity-20 text-white">
              <FiClock className="mr-1" /> Ultima actualizare:{" "}
              {new Date().toLocaleDateString("ro-RO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          {/* Table of Contents */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Cuprins
            </h2>
            <nav>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <li>
                  <a
                    href="#information-collection"
                    className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                  >
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mr-2">
                      1
                    </span>
                    Informațiile pe care le colectăm
                  </a>
                </li>
                <li>
                  <a
                    href="#information-use"
                    className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                  >
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mr-2">
                      2
                    </span>
                    Cum folosim informațiile dvs.
                  </a>
                </li>
                <li>
                  <a
                    href="#information-sharing"
                    className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                  >
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mr-2">
                      3
                    </span>
                    Partajarea informațiilor
                  </a>
                </li>
                <li>
                  <a
                    href="#data-security"
                    className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                  >
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mr-2">
                      4
                    </span>
                    Securitatea datelor
                  </a>
                </li>
                <li>
                  <a
                    href="#your-choices"
                    className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                  >
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mr-2">
                      5
                    </span>
                    Opțiunile dvs.
                  </a>
                </li>
                <li>
                  <a
                    href="#policy-changes"
                    className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                  >
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mr-2">
                      6
                    </span>
                    Modificări ale politicii
                  </a>
                </li>
                <li>
                  <a
                    href="#contact-us"
                    className="flex items-center text-blue-600 hover:text-blue-800 py-1"
                  >
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mr-2">
                      7
                    </span>
                    Contactați-ne
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Policy Content */}
          <div className="px-6 py-8 space-y-10">
            <div className="prose prose-blue max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
                La MeetingMate, luăm în serios confidențialitatea dvs. Această
                Politică de Confidențialitate explică ce informații colectăm,
                cum le utilizăm și cum le protejăm. Prin utilizarea platformei
                noastre, sunteți de acord cu colectarea și utilizarea
                informațiilor conform acestei politici.
              </p>
            </div>

            <section id="information-collection" className="scroll-mt-20">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 mr-3">
                  <FiUsers className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Informațiile pe care le colectăm
                </h2>
              </div>
              <div className="pl-12 text-gray-700 space-y-4">
                <p>Colectăm următoarele tipuri de informații:</p>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 space-y-3">
                  <div className="flex items-start">
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-1 mr-2">
                      •
                    </span>
                    <p>
                      <strong>Informații de înregistrare:</strong> Numele,
                      adresa de email, parola și datele de profil.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-1 mr-2">
                      •
                    </span>
                    <p>
                      <strong>Conținut generat de utilizator:</strong> Mesaje,
                      fișiere, comentarii și alte conținuturi pe care le creați
                      sau le încărcați.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-1 mr-2">
                      •
                    </span>
                    <p>
                      <strong>Date de utilizare:</strong> Informații despre cum
                      folosiți platforma, cum ar fi paginile vizitate, acțiunile
                      întreprinse și momentele de activitate.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-1 mr-2">
                      •
                    </span>
                    <p>
                      <strong>Informații despre dispozitiv:</strong> Tipul de
                      dispozitiv, sistemul de operare, browser și alte
                      informații tehnice.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="information-use" className="scroll-mt-20">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 mr-3">
                  <FiInfo className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Cum folosim informațiile dvs.
                </h2>
              </div>
              <div className="pl-12 text-gray-700 space-y-4">
                <p>Utilizăm informațiile colectate pentru:</p>
                <ul className="list-none space-y-3">
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-0.5 mr-3">
                      1
                    </span>
                    <p>
                      Furnizarea, întreținerea și îmbunătățirea platformei
                      noastre
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-0.5 mr-3">
                      2
                    </span>
                    <p>
                      Personalizarea experienței dvs. și oferirea conținutului
                      relevant
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-0.5 mr-3">
                      3
                    </span>
                    <p>
                      Comunicarea cu dvs. despre actualizări, alertele de
                      securitate și mesaje administrative
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-0.5 mr-3">
                      4
                    </span>
                    <p>
                      Analizarea tendințelor de utilizare și îmbunătățirea
                      serviciilor
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center mt-0.5 mr-3">
                      5
                    </span>
                    <p>
                      Detectarea, prevenirea și abordarea problemelor tehnice și
                      de securitate
                    </p>
                  </li>
                </ul>
              </div>
            </section>

            <section id="information-sharing" className="scroll-mt-20">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 mr-3">
                  <FiGlobe className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Partajarea informațiilor
                </h2>
              </div>
              <div className="pl-12 text-gray-700 space-y-4">
                <p>Putem împărtăși informațiile dvs. cu:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Furnizori de servicii
                    </h3>
                    <p className="text-gray-600">
                      Companii care ne ajută să oferim serviciile noastre, cum
                      ar fi găzduirea cloud și analiză.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Parteneri
                    </h3>
                    <p className="text-gray-600">
                      Organizații cu care colaborăm pentru a vă oferi
                      funcționalități îmbunătățite.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Alți utilizatori
                    </h3>
                    <p className="text-gray-600">
                      În funcție de setările dvs. de confidențialitate și modul
                      în care folosiți platforma.
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Cerințe legale
                    </h3>
                    <p className="text-gray-600">
                      Când suntem obligați să respectăm legea sau să protejăm
                      drepturile și siguranța.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="data-security" className="scroll-mt-20">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 mr-3">
                  <FiLock className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Securitatea datelor
                </h2>
              </div>
              <div className="pl-12 text-gray-700 space-y-4">
                <p>
                  Luăm măsuri rezonabile pentru a proteja informațiile dvs.
                  împotriva accesului neautorizat, alterării, dezvăluirii sau
                  distrugerii. Acestea includ securizarea tehnică, fizică și
                  administrativă.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <div className="flex">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3">
                      <FiShield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-1">
                        Angajamentul nostru pentru securitate
                      </h3>
                      <p className="text-blue-700">
                        Deși nicio metodă de transmitere pe internet sau de
                        stocare electronică nu este 100% sigură, ne străduim să
                        utilizăm mijloace acceptabile comercial pentru a proteja
                        datele dvs. personale.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="your-choices" className="scroll-mt-20">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 mr-3">
                  <FiUsers className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Opțiunile dvs.
                </h2>
              </div>
              <div className="pl-12 text-gray-700 space-y-4">
                <p>
                  Aveți anumite drepturi și opțiuni privind informațiile dvs.:
                </p>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <ul className="space-y-4">
                    <li className="flex">
                      <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          Accesarea și actualizarea
                        </h3>
                        <p className="text-gray-600">
                          Puteți accesa și actualiza informațiile dvs. de profil
                          în setările contului.
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          Ștergerea datelor
                        </h3>
                        <p className="text-gray-600">
                          Puteți solicita ștergerea contului și a datelor dvs.
                          personale.
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          Gestionarea notificărilor
                        </h3>
                        <p className="text-gray-600">
                          Puteți configura preferințele de notificare și
                          comunicare.
                        </p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          Revocarea consimțământului
                        </h3>
                        <p className="text-gray-600">
                          Puteți revoca consimțământul pentru colectarea
                          anumitor date în orice moment.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="policy-changes" className="scroll-mt-20">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 mr-3">
                  <FiClock className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Modificări ale politicii
                </h2>
              </div>
              <div className="pl-12 text-gray-700 space-y-4">
                <p>
                  Putem actualiza această Politică de Confidențialitate din când
                  în când. Dacă facem modificări semnificative, vă vom notifica
                  prin email sau prin intermediul platformei. Data ultimei
                  actualizări va fi întotdeauna indicată la începutul acestei
                  politici.
                </p>
              </div>
            </section>

            <section id="contact-us" className="scroll-mt-20">
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-full bg-blue-100 text-blue-700 mr-3">
                  <FiMail className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Contactați-ne
                </h2>
              </div>
              <div className="pl-12 text-gray-700">
                <p className="mb-4">
                  Dacă aveți întrebări despre această Politică de
                  Confidențialitate, contactați-ne la:
                </p>
                <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FiMail className="text-blue-600 mr-3" />
                      <strong className="text-gray-700 mr-2">Email:</strong>
                      <a
                        href="mailto:privacy@meetingmate.com"
                        className="text-blue-600 hover:underline"
                      >
                        privacy@meetingmate.com
                      </a>
                    </div>
                    <div className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600 mr-3 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div>
                        <strong className="text-gray-700">Adresă:</strong>
                        <p className="text-gray-600">
                          123 Tech Park, Silicon Valley, CA 94025
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
