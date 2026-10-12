import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DEFAULT_ECARD_UUID } from '../data/ecardData';

export const CustomEditRedirectPage: React.FC = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const targetUuid = uuid || DEFAULT_ECARD_UUID;

  useEffect(() => {
    navigate(
      `/ecd/signin/${targetUuid}?redirect=${encodeURIComponent(
        `/ecd/custom-edit/${targetUuid}`
      )}`,
      { replace: true }
    );
  }, [navigate, targetUuid]);

  return null;
};

export const SignInPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const isValidPhone = /^0\d{9}$/.test(phone);

  return (
    <div className="relative w-full h-full">
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F5] px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-[#A33149] mb-6">
            Đăng nhập/Đăng ký
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Nếu đây là lần đầu tiên bạn truy cập vào trang này, hãy nhập số điện thoại để đăng ký
            nhé!
          </p>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#A33149]"
            placeholder="Nhập số điện thoại"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
          <button
            disabled={!isValidPhone}
            className={`w-full font-bold py-2 rounded-md transition ${
              isValidPhone
                ? 'bg-[#A33149] text-white hover:opacity-90'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            Đăng nhập/Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
};
