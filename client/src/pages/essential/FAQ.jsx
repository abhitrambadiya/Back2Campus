import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const faqs = [
  {
    question: "What is Back2Campus?",
    answer:
      "Back2Campus is a student-driven initiative that helps students transition smoothly into campus life with events, resources, and peer-to-peer support."
  },
  {
    question: "Who can participate in Back2Campus?",
    answer:
      "All students of our college can participate! Whether you’re a fresher or a senior, you are welcome to join."
  },
  {
    question: "Is there any registration fee?",
    answer:
      "Nope! Back2Campus activities are completely free. Some workshops may require prior registration due to limited seats."
  },
  {
    question: "How do I stay updated about upcoming events?",
    answer:
      "Follow our official Back2Campus Instagram handle, join the WhatsApp groups, or keep an eye on campus notice boards."
  },
  {
    question: "Can I volunteer for Back2Campus?",
    answer:
      "Absolutely! We’re always looking for enthusiastic volunteers. Fill out the volunteer form on our website to apply."
  },
  {
    question: "Do I need to bring anything for the events?",
    answer:
      "Not necessarily. Most events require just your enthusiasm! If anything special is needed, we’ll inform you beforehand."
  },
  {
    question: "Will there be certificates for participation?",
    answer:
      "Yes! Participants of select workshops and competitions will receive certificates to recognize their efforts."
  },
  {
    question: "Are there networking opportunities?",
    answer:
      "Definitely! Back2Campus brings students, seniors, and clubs together — a great chance to make friends and connections."
  },
  {
    question: "Can I suggest an event or activity?",
    answer:
      "Of course! We love fresh ideas. You can drop your suggestions through our website form or directly contact the organizing team."
  },
  {
    question: "What should I do if I have more questions?",
    answer:
      "Feel free to reach out to the Back2Campus team via our official email or social media pages. We’re always happy to help."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h1>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search FAQs..."
          className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-2xl shadow-sm p-4 bg-white transition-all duration-300"
            >
              <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-40 mt-3" : "max-h-0"
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}