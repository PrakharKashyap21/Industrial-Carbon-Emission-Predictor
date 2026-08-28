import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

export const Register = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-slate-50">
      <RegisterForm />
    </div>
  );
};

export default Register;
