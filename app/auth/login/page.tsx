"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PinInput from "@/components/pin-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  verifyPin,
  generateToken,
  TokenStorage,
  UserStorage,
} from "@/lib/auth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePinComplete = async (pin: string) => {
    setIsLoading(true);
    setError("");

    try {
      // Verify PIN against hardcoded value
      if (!verifyPin(pin)) {
        setError("Invalid PIN. Please try again.");
        setIsLoading(false);
        return;
      }

      // Set user ID as single-user
      const userId = "single-user";
      UserStorage.setUserId(userId);

      // Generate token and store
      const { token, expiresAt } = generateToken(userId);
      TokenStorage.set(token, expiresAt);

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl sm:text-5xl font-bold text-primary">₹</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center">
              Expensify
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Enter your PIN to continue
            </p>
          </div>

          <div className="w-full">
            <PinInput onComplete={handlePinComplete} isLoading={isLoading} />
          </div>

          {error && (
            <div className="w-full p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-xs sm:text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
