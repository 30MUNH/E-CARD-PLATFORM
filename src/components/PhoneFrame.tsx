import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="w-[360px] md:w-[400px] max-w-full mx-auto snap-center shrink-0 p-[50px]">
      <div className="relative rounded-[35px] bg-gray-800 p-3 shadow-xl z-[15] aspect-[9/16] pointer-events-none">
        <div className="absolute left-1/2 translate-x-[-50%] top-[15px] w-12 h-3.5 bg-gray-800 rounded-full z-[100]" />
        <div className="relative bg-white rounded-[20px] overflow-hidden z-0 w-full h-full flex flex-col pointer-events-auto">
          <div className="flex-1 overflow-auto relative bg-[url('/template/background-template.jpg')] bg-cover bg-center">
            {children}
          </div>
          <div className="w-1/2 h-1 mx-auto my-2 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
