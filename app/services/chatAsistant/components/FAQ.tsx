// components/chat/FAQ.tsx
import React from "react";
import FAQItem from "./FAQItems";

// FAQ items data
const faqItems = [
  {
    id: 1,
    question: "Cât de rapid voi primi un răspuns?",
    answer:
      "Timpul mediu de răspuns este sub 2 minute în timpul programului de lucru. În afara orelor de program, un agent va reveni cu un răspuns în maxim 12 ore.",
  },
  {
    id: 2,
    question: "Este chat-ul disponibil non-stop?",
    answer:
      "Da, platforma de chat este disponibilă 24/7. În afara orelor de program, poți lăsa un mesaj și vei primi răspuns când echipa revine online.",
  },
  {
    id: 3,
    question: "Pot descărca istoricul conversației?",
    answer:
      "Da, la sfârșitul fiecărei conversații ai opțiunea de a descărca un transcript complet în format PDF sau de a-l primi pe email.",
  },
  {
    id: 4,
    question: "Cum pot ajunge la un agent uman?",
    answer:
      "Ești conectat automat cu un agent uman. Nu folosim roboți pentru conversațiile inițiale, ci doar experți reali pregătiți să te ajute.",
  },
];

const FAQ: React.FC = () => {
  return (
    <div className="mt-20">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Întrebări frecvente
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {faqItems.map((item) => (
          <FAQItem
            key={item.id}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
