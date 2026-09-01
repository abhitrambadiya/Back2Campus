import React from "react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#f9fafb] text-center px-6 py-16">
      {/* Header */}
      <h1 className="text-4xl font-bold text-[#111827] mb-6">
        About Nexus Hub
      </h1>
      <p className="text-lg text-[#4b5563] max-w-3xl mx-auto mb-12">
        Nexus Hub is the official Alumni Association platform built to strengthen 
        connections between graduates, students, and the institution. It serves as 
        a bridge to preserve memories, share knowledge, and open opportunities for 
        collaboration across the globe.
      </p>

      {/* Sections */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-xl shadow-md border border-[#e5e7eb]">
          <h2 className="text-2xl font-semibold text-[#111827] mb-4">
            Our Mission
          </h2>
          <p className="text-[#4b5563]">
            To build a lifelong community that empowers alumni and students to 
            share knowledge, foster mentorship, and create meaningful professional 
            and personal connections.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md border border-[#e5e7eb]">
          <h2 className="text-2xl font-semibold text-[#111827] mb-4">
            Our Vision
          </h2>
          <p className="text-[#4b5563]">
            To make Nexus Hub a global network where alumni achievements, 
            opportunities, and collaborations strengthen both individuals and 
            the institution’s legacy.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-md border border-[#e5e7eb] md:col-span-2">
          <h2 className="text-2xl font-semibold text-[#111827] mb-4">
            Why Nexus Hub?
          </h2>
          <p className="text-[#4b5563]">
            Nexus Hub goes beyond being a platform—it’s a digital home for alumni. 
            It provides a space to reconnect with peers, celebrate milestones, 
            and contribute towards the growth of future generations. 
            With features like directories, mentorship, and discussions, 
            it ensures the alumni community remains vibrant and active.
          </p>
        </div>
      </div>
    </div>
  );
}
