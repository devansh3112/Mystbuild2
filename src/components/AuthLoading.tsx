import React from "react";

const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center">
        <div className="animate-spin mb-4 h-12 w-12 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
        <h2 className="text-2xl font-semibold">Loading...</h2>
        <p className="text-muted-foreground mt-2">Setting up your experience</p>
      </div>
    </div>
  );
};

export default AuthLoading; 