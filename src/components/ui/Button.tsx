import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="bg-black text-white px-6 py-2 rounded-xl shadow hover:opacity-90 transition disabled:opacity-50"
    >
      {children}
    </button>
  );
};
