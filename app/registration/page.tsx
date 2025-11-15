"use client";
import RegistrationAuth from '@/components/auth/RegistrationAuth';
import RegistrationOrTicket from '@/components/registration/RegistrationOrTicket';

export default function RegistrationPage() {
  return (
    <div className='flex flex-1 items-center justify-center p-4 pt-16 lg:pt-4 w-full'>
      <RegistrationAuth className='max-w-xl w-full'>
        <RegistrationOrTicket />
      </RegistrationAuth>
    </div>
  );
}
