import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export const Login = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
      <LoginForm />
    </div>
  );
};

export default Login;
