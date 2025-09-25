import React from 'react';

interface WelcomeCardProps {
  className?: string;
}

export default function WelcomeCard({ className }: WelcomeCardProps) {
  const handleGetStarted = () => {
    // Handle get started action
    console.log('Get Started clicked');
  };

  return (
    <div className={`bg-white box-border caret-transparent gap-x-[21px] flex flex-col max-w-[392px] outline-[oklab(0.708_0_0_/_0.5)] gap-y-[21px] text-center w-full border rounded-[12.75px] border-solid border-black/10 ${className || ''}`}>
      <div className="items-start box-border caret-transparent gap-x-[5.25px] grid auto-rows-min grid-rows-[auto_auto] outline-[oklab(0.708_0_0_/_0.5)] gap-y-[5.25px] pt-[21px] pb-7 px-[21px]">
        <div className="items-center bg-[oklch(0.6_0.118_184.704)] box-border caret-transparent flex h-14 justify-center outline-[oklab(0.708_0_0_/_0.5)] w-14 mb-3.5 mx-auto rounded-[3.35544e+07px]">
          <img 
            src="https://c.animaapp.com/mf9achtzLNLvGx/assets/icon-1.svg" 
            alt="Icon" 
            className="text-white box-border caret-transparent h-7 outline-[oklab(0.708_0_0_/_0.5)] w-7" 
          />
        </div>
        <h4 className="text-[21px] box-border caret-transparent leading-7 outline-[oklab(0.708_0_0_/_0.5)]">Welcome to bimo</h4>
        <p className="text-gray-500 text-[15.75px] box-border caret-transparent leading-[24.5px] outline-[oklab(0.708_0_0_/_0.5)]">
          Take control of your startup's API and cloud spending
        </p>
      </div>
      <div className="box-border caret-transparent outline-[oklab(0.708_0_0_/_0.5)] pb-[21px] px-[21px]">
        <p className="text-gray-500 box-border caret-transparent outline-[oklab(0.708_0_0_/_0.5)] mb-7">
          Monitor costs across Claude, AWS, Zoom and more. Set budgets, get alerts, and optimize your spend.
        </p>
        <button 
          className="text-[oklch(1_0_0)] text-[12.25px] font-medium items-center bg-[oklch(0.6_0.118_184.704)] caret-transparent gap-x-[7px] inline-flex shrink-0 h-[35px] justify-center leading-[17.5px] outline-[oklab(0.708_0_0_/_0.5)] gap-y-[7px] text-left text-nowrap w-full px-[21px] py-0 rounded-[6.75px]"
          onClick={handleGetStarted}
          type="button"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
