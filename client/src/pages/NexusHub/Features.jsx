import React from "react";

export default function Features() {
  const features = [
    {
      title: "Alumni Directory",
      description:
        "A searchable database of alumni profiles that allows current students and fellow alumni to connect, collaborate, and network effectively.",
    },
    {
      title: "Job & Internship Board",
      description:
        "Exclusive opportunities posted by alumni and industry partners, creating a bridge between students, alumni, and recruiters.",
    },
    {
      title: "Mentorship Program",
      description:
        "A dedicated platform where alumni can mentor students or peers, offering career guidance, skill-building advice, and industry insights.",
    },
    {
      title: "Discussion Forums",
      description:
        "Interactive community spaces where alumni and students can share knowledge, ask questions, and collaborate on ideas.",
    },
    {
      title: "Newsletter & Announcements",
      description:
        "Stay informed with regular updates on alumni achievements, college highlights, and important association news.",
    },
    {
      title: "Alumni Map",
      description:
        "A global view of where alumni are located, showcasing the widespread reach of our community and building stronger worldwide connections.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header Section */}
      <section className="bg-[#4f46e5] text-white py-12 px-6 text-center">
        <h1 className="text-4xl font-bold">Nexus Hub Features</h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto">
          Discover the features that make our Alumni Association platform modern, 
          dynamic, and community-driven.
        </p>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-[#e5e7eb] bg-white"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#111827] mb-3">
                {feature.title}
              </h2>
              <p className="text-[#4b5563]">{feature.description}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="bg-[#4338ca] text-white py-12 text-center">
        <h2 className="text-2xl font-semibold">Join the Alumni Community</h2>
        <p className="mt-2 mb-6">
          Be part of a lifelong network of learning, growth, and opportunities.
        </p>
        
      </section>
    </div>
  );
}
