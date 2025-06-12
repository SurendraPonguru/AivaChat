
import React from 'react';

const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path fillRule="evenodd" d="M4.5 3.75a3 3 0 00-3 3v10.5a3 3 0 003 3h15a3 3 0 003-3V6.75a3 3 0 00-3-3h-15zm4.125 3.375a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h6.75a.75.75 0 000-1.5h-6.75zm0 3.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" />
    <path d="M2.25 6.75c0-.204.02-.405.059-.6H2.25v.6zM2.25 17.25c0 .204.02.405.059.6H2.25v-.6zM21.75 6.75c0-.204-.02-.405-.059-.6H21.75v.6zM21.75 17.25c0 .204-.02-.405-.059.6H21.75v-.6z"/>
  </svg>
);

export default BotIcon;
