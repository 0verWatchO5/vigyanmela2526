import React from "react";

interface TicketProps {
  logoSrc?: string;
  attendingText?: string;
  title?: string;
  dateRange?: string;
  venue?: string;
  name?: string;
  email?: string;
  phone?: string;
  ticketId?: string;
}

export const TicketCard: React.FC<TicketProps> = ({
  logoSrc = "/images/VN.png",
  attendingText = "You are attending",
  title = "Chetana College",
  dateRange = "Thur, 11 Dec, 2025 – Fri, 12 Dec, 2025",
  venue = "706, 7th floor, Chetana College Bandra (E), Mumbai, Maharashtra, India",
  name = "Full Name",
  email = "email@example.com",
  phone = "1234567890",
  ticketId = "AAA000",
}) => {
  return (
    <div className="mx-auto max-w-xs bg-white shadow-md rounded-2xl p-5 text-slate-900 font-sans">
      {/* Header / Logo */}
      <div className="flex items-center justify-center mb-3">
        <img src={logoSrc} alt="logo" className="h-10 w-10 object-contain" />
      </div>

      {/* Attending text + Title */}
      <div className="text-center">
        <p className="text-sm text-gray-500">{attendingText}</p>
        <h1 className="mt-1 text-xl font-semibold">{title}</h1>
      </div>

      <hr className="my-4 border-t border-gray-200" />

      {/* Date row */}
      <div className="flex items-start gap-3">
        <div className="text-blue-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10H9V12H7V10Z" fill="currentColor" />
            <path d="M11 10H13V12H11V10Z" fill="currentColor" />
            <path d="M15 10H17V12H15V10Z" fill="currentColor" />
            <path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">{dateRange}</p>
        </div>
      </div>

      {/* Location row */}
      <div className="flex items-start gap-3 mt-3">
        <div className="text-red-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 13.25 11.11 19.34 11.45 19.68C11.74 19.97 12.24 19.97 12.53 19.68C12.87 19.34 19 13.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700">{venue}</p>
        </div>
      </div>

      <hr className="my-4 border-t border-gray-100" />

      {/* Booking Details heading */}
      <p className="text-sm font-medium text-gray-600 mb-3">Your Booking Details</p>

      <div className="bg-gray-50 rounded-xl p-3">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <div className="text-xs text-gray-500">Ticket ID</div>
          <div className="text-sm font-semibold text-gray-900 tracking-widest uppercase">
            {ticketId}
          </div>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <div className="text-xs text-gray-500">Name</div>
          <div className="text-sm font-medium text-gray-800">{name}</div>
        </div>
        <div className="flex justify-between py-2">
          <div className="text-xs text-gray-500">Phone</div>
          <div className="text-sm font-medium text-gray-800">{phone}</div>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <div className="text-xs text-gray-500">Email</div>
          <div className="text-sm font-medium text-gray-800">{email}</div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-gray-400">Present this ticket at entry. Valid ID may be required.</div>
    </div>
  );
};

export default TicketCard;
