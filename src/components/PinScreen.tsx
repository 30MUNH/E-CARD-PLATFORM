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
  const pinRef = useRef('');
  const [hasErrorFeedback, setHasErrorFeedback] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verificationSeqRef = useRef(0);

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
    const currentSeq = ++verificationSeqRef.current;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    const basePin = pinRef.current.length >= 4 ? '' : pinRef.current;
    const nextPin = basePin + digit;
    pinRef.current = nextPin;
    setHasErrorFeedback(false);
    setPin(nextPin);

    if (nextPin.length === 4) {
      void verifyCandidate(nextPin).then((result) => {
        if (currentSeq !== verificationSeqRef.current) return;
        if (result.authorized) {
          onSuccess(result);
        } else {
          setHasErrorFeedback(true);
          toast.error(result.errorMessage || 'Sai mã PIN');
          resetTimerRef.current = setTimeout(() => {
            if (currentSeq === verificationSeqRef.current) {
              pinRef.current = '';
              setPin('');
              setHasErrorFeedback(false);
            }
            resetTimerRef.current = null;
          }, 450);
        }
      });
    }
  };

  const handleDelete = () => {
    verificationSeqRef.current++;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    if (pinRef.current.length === 0) return;
    const nextPin = pinRef.current.slice(0, -1);
    pinRef.current = nextPin;
    setHasErrorFeedback(false);
    setPin(nextPin);
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-[#8A2B3D] bg-[#FAF7F2] bg-[url('/template/background-template.jpg')] bg-cover bg-center px-4">
      <div className="flex flex-col items-center justify-center w-full max-w-sm md:max-w-md p-6">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center text-[#8A2B3D]">{heading}</h2>
        <p className="mb-6 text-center text-[#8A2B3D] text-sm md:text-base">{subheading}</p>
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
                  ? 'bg-[#8A2B3D] border-[#8A2B3D]'
                  : 'border-[#8A2B3D]'
              }`}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 md:gap-5 w-full max-w-[280px]">
          {KEYPAD_DIGITS.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              onTouchStart={onTouchStart}
              className="w-16 h-16 md:w-[68px] md:h-[68px] rounded-full border border-[#8A2B3D]/70 text-[#8A2B3D] text-xl font-normal hover:bg-[#8A2B3D]/10 active:scale-95 transition flex items-center justify-center mx-auto"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            onTouchStart={onTouchStart}
            className="w-16 h-16 md:w-[68px] md:h-[68px] rounded-full border border-[#8A2B3D]/70 text-[#8A2B3D] text-xl font-normal hover:bg-[#8A2B3D]/10 active:scale-95 transition flex items-center justify-center mx-auto"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            onTouchStart={onTouchStart}
            disabled={pin.length === 0}
            className="text-sm underline text-[#8A2B3D] disabled:opacity-40 flex items-center justify-center"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
