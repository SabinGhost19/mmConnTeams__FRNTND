"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiSearch,
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiUser,
  FiUsers,
  FiLayers,
  FiClock,
  FiShield,
  FiDollarSign,
  FiTag,
  FiBookmark,
  FiBook,
} from "react-icons/fi";
import Footer from "../services/chatAsistant/components/Footer";
import { useSearchParams } from "next/navigation";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

interface FaqCategory {
  name: string;
  icon: React.ReactNode;
}

const HelpCenter: React.FC = () => {
  const searchParams = useSearchParams();
  const [backPath, setBackPath] = useState("/");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const from = searchParams.get("from");
    if (from === "register") {
      setBackPath("/register");
    } else {
      setBackPath("/");
    }
  }, [searchParams]);

  const categories: FaqCategory[] = [
    { name: "Toate", icon: <FiHelpCircle /> },
    { name: "Echipe", icon: <FiUsers /> },
    { name: "Canale", icon: <FiLayers /> },
    { name: "Tichete", icon: <FiTag /> },
    { name: "Profil", icon: <FiUser /> },
    { name: "Securitate", icon: <FiShield /> },
  ];

  const faqItems: FaqItem[] = [
    {
      question: "Cum creez o echipă?",
      answer:
        "Pentru a crea o echipă, navigați la secțiunea Echipe din bara laterală și faceți clic pe butonul 'Creează Echipă'. Completați informațiile necesare, cum ar fi numele echipei și descrierea, apoi faceți clic pe 'Creează'. Noua echipă va apărea în lista echipelor dvs.",
      category: "Echipe",
      icon: <FiUsers className="h-5 w-5 text-blue-500" />,
    },
    {
      question: "Cum invit membri în echipa mea?",
      answer:
        "După ce ați creat o echipă, deschideți pagina de detalii a echipei făcând clic pe numele echipei. Căutați fila sau secțiunea 'Membri', apoi faceți clic pe 'Invită Membri'. Introduceți adresele de email ale persoanelor pe care doriți să le invitați, adăugați un mesaj opțional și trimiteți invitațiile.",
      category: "Echipe",
      icon: <FiUsers className="h-5 w-5 text-blue-500" />,
    },
    {
      question: "Cum creez un canal în echipa mea?",
      answer:
        "Deschideți pagina echipei dvs., apoi căutați secțiunea 'Canale'. Faceți clic pe butonul 'Creează Canal', introduceți un nume și o descriere pentru canalul dvs. și selectați setările corespunzătoare. Faceți clic pe 'Creează' pentru a finaliza noul canal.",
      category: "Canale",
      icon: <FiLayers className="h-5 w-5 text-indigo-500" />,
    },
    {
      question: "Cum creez și atribui tichete?",
      answer:
        "Navigați la canalul în care doriți să creați un tichet. Căutați secțiunea 'Tichete' și faceți clic pe 'Creează Tichet'. Completați detaliile tichetului, inclusiv titlu, descriere, termen limită și selectați un membru al echipei din meniul derulant pentru a atribui tichetul. Faceți clic pe 'Creează' pentru a crea și atribui tichetul.",
      category: "Tichete",
      icon: <FiTag className="h-5 w-5 text-green-500" />,
    },
    {
      question: "Cum îmi actualizez informațiile de profil?",
      answer:
        "Faceți clic pe poza sau pictograma profilului dvs. din colțul din dreapta sus al aplicației și selectați 'Profil' din meniul derulant. Pe pagina de profil, faceți clic pe 'Editează Profil' pentru a actualiza informațiile dvs., cum ar fi numele, emailul, biografia și poza de profil.",
      category: "Profil",
      icon: <FiUser className="h-5 w-5 text-purple-500" />,
    },
    {
      question: "Ce scurtături de tastatură sunt disponibile?",
      answer:
        "MeetingMate oferă mai multe scurtături de tastatură pentru a spori productivitatea: Ctrl+K pentru a deschide bara de căutare, Ctrl+N pentru a crea un element nou (echipă, canal sau tichet, în funcție de context), Esc pentru a anula sau închide o fereastră modală și Ctrl+/ pentru a vizualiza toate scurtăturile disponibile.",
      category: "Generale",
      icon: <FiBook className="h-5 w-5 text-amber-500" />,
    },
    {
      question: "Cât de sigure sunt datele mele pe MeetingMate?",
      answer:
        "MeetingMate ia în serios securitatea datelor. Folosim criptare standard pentru toate datele transmise între browserul dvs. și serverele noastre. Informațiile dvs. sunt stocate în siguranță și avem controale stricte de acces. Pentru mai multe detalii, consultați Politica noastră de confidențialitate.",
      category: "Securitate",
      icon: <FiShield className="h-5 w-5 text-red-500" />,
    },
    {
      question: "Cum îmi anulez abonamentul?",
      answer:
        "Pentru a vă anula abonamentul, accesați pagina 'Setări' făcând clic pe profilul dvs. și selectând 'Setări'. Navigați la fila 'Facturare' sau 'Abonament' și faceți clic pe 'Anulare Abonament'. Urmați instrucțiunile pentru a finaliza procesul de anulare.",
      category: "Generale",
      icon: <FiDollarSign className="h-5 w-5 text-emerald-500" />,
    },
  ];

  // Filtrează elementele FAQ în funcție de interogarea de căutare și categoria selectată
  const filteredFaqItems = faqItems.filter((item) => {
    const matchesQuery =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "Toate" ||
      item.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const toggleFaq = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
            Centrul de Ajutor
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            Găsiți răspunsuri la întrebările frecvente despre utilizarea
            MeetingMate și descoperiți cum să vă maximizați experiența
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8 bg-white p-5 rounded-xl shadow-sm">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Căutați întrebări și răspunsuri..."
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Categories & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-700">
                <h3 className="text-base font-semibold text-white">
                  Categorii
                </h3>
              </div>
              <nav className="p-3">
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category.name}>
                      <button
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.name ||
                          (category.name === "Toate" && !selectedCategory)
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="mr-2">{category.icon}</span>
                        <span className="font-medium text-sm">
                          {category.name}
                        </span>
                        {(selectedCategory === category.name ||
                          (category.name === "Toate" && !selectedCategory)) && (
                          <span className="ml-auto bg-blue-100 text-blue-800 text-xs py-0.5 px-1.5 rounded-full">
                            {category.name === "Toate"
                              ? faqItems.length
                              : faqItems.filter(
                                  (item) => item.category === category.name
                                ).length}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Quick Help Link */}
            <div className="mt-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 shadow-sm border border-blue-100">
              <p className="text-gray-700 text-sm mb-2">
                Aveți nevoie de asistență suplimentară?
              </p>
              <a
                href="mailto:support@meetingmate.com"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <FiMail className="mr-1 h-4 w-4" />
                Contactați-ne
              </a>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  Întrebări Frecvente{" "}
                  {selectedCategory && selectedCategory !== "Toate"
                    ? `- ${selectedCategory}`
                    : ""}
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs py-0.5 px-2 rounded-full">
                  {filteredFaqItems.length} rezultate
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {filteredFaqItems.length > 0 ? (
                  filteredFaqItems.map((item, index) => (
                    <div
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <button
                        className="w-full py-4 px-5 text-left flex justify-between items-center focus:outline-none"
                        onClick={() => toggleFaq(index)}
                      >
                        <div className="flex items-center pr-4">
                          <div className="flex-shrink-0 mr-3">{item.icon}</div>
                          <span className="font-medium text-gray-900 text-sm">
                            {item.question}
                          </span>
                        </div>
                        <div
                          className={`rounded-full p-1 transition-colors ${
                            expandedIndex === index
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {expandedIndex === index ? (
                            <FiChevronUp className="h-4 w-4" />
                          ) : (
                            <FiChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {expandedIndex === index && (
                        <div className="py-3 px-5 pb-5 bg-gray-50 border-t border-gray-100">
                          <div className="pl-10 pr-2 text-gray-700 text-sm leading-relaxed">
                            <p>{item.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                      <FiSearch className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm mb-2">
                      Nu am găsit rezultate pentru "{searchQuery}"
                    </p>
                    <p className="text-gray-500 text-xs max-w-md mx-auto">
                      Încercați să reformulați căutarea
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
