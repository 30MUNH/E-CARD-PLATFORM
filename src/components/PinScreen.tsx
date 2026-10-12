import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { getCardAccessService } from '../services';
import { PinScreenConfig, PinVerificationResult } from '../types/ecard';

export interface PinScreenProps {
  ecardId: string;
  onSuccess: (result?: PinVerificationResult) => void;
  onTouchStart?: () => void;
  /**
   * Injectable PIN verification callback.
   * Defaults to CardAccessService.verifyPin(ecardId, pin) when omitted.
   * Product requirement: Unlimited immediate retries (no attempt counter, no lockout, no cooldown).
   */
  onVerifyPin?: (pin: string) => Promise<PinVerificationResult | boolean>;
  pinScreenConfig?: PinScreenConfig;
}

const KEYPAD_DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const PinScreen: React.FC<PinScreenProps> = ({
  ecardId,
  onSuccess,
  onTouchStart,
  onVerifyPin,
  pinScreenConfig,
}) => {
  const [pin, setPin] = useState('');
  const [hasErrorFeedback, setHasErrorFeedback] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const verifyCandidate = async (candidate: string) => {
    try {
      if (onVerifyPin) {
        const res = await onVerifyPin(candidate);
        if (typeof res === 'boolean') {
          return { authorized: res, isMockMode: true } as PinVerificationResult;
        }
        return res;
      }
      return await getCardAccessService().verifyPin(ecardId, candidate);
    } catch {
      return {
        authorized: false,
        errorMessage: 'Sai mã PIN',
        isMockMode: true,
      };
    }
  };

  const handleDigitClick = (digit: string) => {
    // If previous attempt just failed and auto-clear timer is still pending,
    // allow the recipient to immediately start typing a new attempt without waiting!
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    const basePin = pin.length >= 4 ? '' : pin;
    const nextPin = basePin + digit;
    setHasErrorFeedback(false);
    setPin(nextPin);

    if (nextPin.length === 4) {
      void verifyCandidate(nextPin).then((result) => {
        if (result.authorized) {
          onSuccess(result);
        } else {
          setHasErrorFeedback(true);
          toast.error(result.errorMessage || 'Sai mã PIN');
          resetTimerRef.current = setTimeout(() => {
            setPin('');
            setHasErrorFeedback(false);
            resetTimerRef.current = null;
          }, 450);
        }
      });
    }
  };

  const handleDelete = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    if (pin.length === 0) return;
    setHasErrorFeedback(false);
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

  const heading = pinScreenConfig?.heading || 'Mở khóa kỷ niệm';
  const subheading = pinScreenConfig?.subheading || 'Bất ngờ cho cậu nà 😜';

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-[#BB254E] bg-[url('/template/background-template.jpg')] bg-cover bg-center px-4">
      <div className="flex flex-col items-center justify-center w-full md:max-w-md md:bg-white/85 md:backdrop-blur-md md:rounded-3xl md:shadow-2xl md:border md:border-rose-100 md:p-10">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">{heading}</h2>
        <p className="mb-6 text-center">{subheading}</p>
        <div
          className={`flex gap-4 mb-8 transition-transform ${
            hasErrorFeedback ? 'scale-105' : ''
          }`}
        >
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                pin.length > idx
                  ? 'bg-[#BB254E] border-[#BB254E]'
                  : 'border-[#BB254E]'
              }`}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 md:gap-5">
          {KEYPAD_DIGITS.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              onTouchStart={onTouchStart}
              className="w-16 h-16 md:w-[68px] md:h-[68px] rounded-full border border-[#BB254E] text-lg md:text-xl hover:bg-[#BB254E]/10 active:scale-95 transition"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            onTouchStart={onTouchStart}
            className="w-16 h-16 md:w-[68px] md:h-[68px] rounded-full border border-[#BB254E] text-lg md:text-xl hover:bg-[#BB254E]/10 active:scale-95 transition"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            onTouchStart={onTouchStart}
            disabled={pin.length === 0}
            className="text-sm underline text-[#BB254E] disabled:opacity-40"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
