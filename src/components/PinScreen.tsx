import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { verifyPinInput } from '../data/ecardData';

interface PinScreenProps {
  ecardId: string;
  onSuccess: () => void;
  onTouchStart?: () => void;
}

const KEYPAD_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const PinScreen: React.FC<PinScreenProps> = ({ onSuccess, onTouchStart }) => {
  const [pin, setPin] = useState('');
  const [isCheckingPin, setIsCheckingPin] = useState(false);
  const [errorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDigitClick = (digit: string) => {
    if (isSubmitting || pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      setIsSubmitting(true);
      if (verifyPinInput(nextPin)) {
        onSuccess();
      } else {
        toast.error('Sai mã PIN');
        setTimeout(() => {
          setPin('');
          setIsSubmitting(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    if (isSubmitting || pin.length === 0) return;
    setPin((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitClick(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (isCheckingPin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#BB254E] bg-url('/template/background-template.jpg')">
        <p className="text-lg">Đang tải...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#BB254E] bg-url('/template/background-template.jpg')">
        <p className="text-red-400 mb-4">{errorMessage}</p>
        <button
          onClick={() => setIsCheckingPin(false)}
          className="px-4 py-2 bg-white text-black rounded-md"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-[#BB254E] bg-url('/template/background-template.jpg')">
      <h2 className="text-2xl font-semibold mb-2">Mở khóa kỷ niệm</h2>
      <p className="mb-6">Bất ngờ cho cậu nà 😜</p>
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full border-2 ${
              pin.length > idx ? 'bg-[#BB254E]' : 'border-[#BB254E]'
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {KEYPAD_DIGITS.map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigitClick(digit)}
            onTouchStart={onTouchStart}
            disabled={isSubmitting}
            className="w-16 h-16 rounded-full border border-[#BB254E] text-lg"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleDigitClick('0')}
          onTouchStart={onTouchStart}
          disabled={isSubmitting}
          className="w-16 h-16 rounded-full border border-[#BB254E] text-lg"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          onTouchStart={onTouchStart}
          disabled={isSubmitting || pin.length === 0}
          className="text-sm underline text-[#BB254E]"
        >
          Xóa
        </button>
      </div>
    </div>
  );
};
