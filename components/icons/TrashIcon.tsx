
import React from 'react';

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    aria-hidden="true" 
    {...props}
  >
    <path 
      fillRule="evenodd" 
      d="M10 3a.75.75 0 01.75.75v1.5h4.5a.75.75 0 010 1.5h-.792L13.24 15.5H6.76l-.218-8.75H5.75a.75.75 0 010-1.5h4.5V3.75A.75.75 0 0110 3zM8.06 7.5l.218 8.75h3.444l.218-8.75H8.06zM13.5 5.25h-7V3.75a1.75 1.75 0 013.5 0V5.25z" 
      clipRule="evenodd" 
    />
  </svg>
);

export default TrashIcon;
