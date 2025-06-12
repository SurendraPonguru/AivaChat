import React from 'react';

const AivaLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Stylized 'A' - A more abstract, tech-inspired design */}
    {/* Left leg of A */}
    <path d="M4 20 L12 4 L13 4" />
    {/* Right leg of A, slightly offset and connected for a modern look */}
    <path d="M11 4 L20 20" />
    {/* Crossbar of A, modern and dynamic */}
    <path d="M6.5 14 H17.5" />
    {/* Optional small circle/dot for a focal point or 'intelligence' representation */}
    <circle cx="12" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export default AivaLogo;