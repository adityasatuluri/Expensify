'use client';

import React from "react"

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  isLoading?: boolean;
}

export default function PinInput({
  length = 4,
  onComplete,
  isLoading = false,
}: PinInputProps) {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const sanitizedValue = value.replace(/[^0-9]/g, '');

    if (sanitizedValue.length > 1) {
      // Handle paste
      const pastedPin = sanitizedValue.slice(0, length);
      const newPin = [...pin];
      for (let i = 0; i < pastedPin.length; i++) {
        newPin[i] = pastedPin[i];
      }
      setPin(newPin);

      // Focus last input
      const lastIndex = Math.min(pastedPin.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();

      // Check if complete
      if (pastedPin.length === length) {
        onComplete(pastedPin);
      }
    } else {
      const newPin = [...pin];
      newPin[index] = sanitizedValue;
      setPin(newPin);

      // Auto-focus next input
      if (sanitizedValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check if complete
      if (newPin.every((digit) => digit !== '')) {
        onComplete(newPin.join(''));
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newPin = [...pin];
      if (pin[index]) {
        newPin[index] = '';
        setPin(newPin);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const clearPin = () => {
    setPin(new Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
      <div className="flex gap-2 sm:gap-3 justify-center">
        {pin.map((digit, index) => (
          <div key={index} className="relative">
            <input
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-primary rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50 transition-all"
              inputMode="numeric"
              autoComplete="off"
            />
            {digit && (
              <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold text-primary pointer-events-none">
                *
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={clearPin}
          disabled={isLoading}
          className="w-full bg-transparent"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
