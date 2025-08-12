import React from "react";


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <div className="flex flex-col items-center max-w-xs">
              <img
                width={231}
                height={70}
                src="/images/meet_white.png"
                alt="Logo"
                className="block mb-4"
              />

              <p className="text-center text-gray-400 dark:text-white/60">
               Welcome to Meet Owner, where we believe that finding the perfect property should be a seamless and empowering experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
