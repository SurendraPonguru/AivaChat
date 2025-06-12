
import React from 'react';

const ChatPlaceholderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    fill="none"
    {...props}
  >
    {/* Simplified representation of a "cosmic thought" or AI brain */}
    {/* Outer glow/aura */}
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3">
      <animate attributeName="r" values="45;48;45" dur="3s" repeatCount="indefinite" />
      <animate attributeName="stroke-opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5">
        <animate attributeName="r" values="38;35;38" dur="3.5s" repeatCount="indefinite" />
    </circle>

    {/* Central "thought" element - a few interconnected nodes */}
    <path d="M50 30 Q40 40 50 50 Q60 40 50 30 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1">
        <animateTransform attributeName="transform" type="rotate" values="0 50 50; 10 50 50; -10 50 50; 0 50 50" dur="5s" repeatCount="indefinite"/>
    </path>
    <path d="M50 70 Q40 60 50 50 Q60 60 50 70 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1">
        <animateTransform attributeName="transform" type="rotate" values="0 50 50; -10 50 50; 10 50 50; 0 50 50" dur="5s" repeatCount="indefinite"/>
    </path>
    <path d="M30 50 Q40 40 50 50 Q40 60 30 50 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1">
        <animateTransform attributeName="transform" type="rotate" values="0 50 50; 5 50 50; -5 50 50; 0 50 50" dur="4s" repeatCount="indefinite" keyTimes="0; 0.33; 0.66; 1"/>
    </path>
    <path d="M70 50 Q60 40 50 50 Q60 60 70 50 Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1">
        <animateTransform attributeName="transform" type="rotate" values="0 50 50; -5 50 50; 5 50 50; 0 50 50" dur="4s" repeatCount="indefinite" keyTimes="0; 0.33; 0.66; 1"/>
    </path>

    {/* Small sparkling stars */}
    <circle cx="30" cy="30" r="1.5" fill="currentColor" fillOpacity="0.7">
      <animate attributeName="r" values="1.5; 2.5; 1.5" dur="2s" begin="0s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0.7; 1; 0.7" dur="2s" begin="0s" repeatCount="indefinite" />
    </circle>
    <circle cx="70" cy="70" r="1.5" fill="currentColor" fillOpacity="0.7">
      <animate attributeName="r" values="1.5; 2.5; 1.5" dur="2s" begin="0.5s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0.7; 1; 0.7" dur="2s" begin="0.5s" repeatCount="indefinite" />
    </circle>
     <circle cx="75" cy="35" r="1" fill="currentColor" fillOpacity="0.6">
      <animate attributeName="r" values="1; 2; 1" dur="2.5s" begin="1s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0.6; 0.9; 0.6" dur="2.5s" begin="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="25" cy="65" r="1" fill="currentColor" fillOpacity="0.6">
      <animate attributeName="r" values="1; 2; 1" dur="2.5s" begin="1.5s" repeatCount="indefinite" />
      <animate attributeName="fill-opacity" values="0.6; 0.9; 0.6" dur="2.5s" begin="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default ChatPlaceholderIcon;
