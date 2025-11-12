import React from "react";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}


export const Label = ({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium text-foreground", className)}
    >
      {children}
    </label>
  );
};

export const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};


export const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

export const InputHoverGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -top-px block h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute inset-x-0 -bottom-px block h-[2px] w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute inset-y-0 -left-px block h-full w-[2px] bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute inset-y-0 -right-px block h-full w-[2px] bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
    </>
  );
};


export const IconUpload = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const IconFile = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-muted-foreground"
    {...props}
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

export const IconX = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-muted-foreground"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
