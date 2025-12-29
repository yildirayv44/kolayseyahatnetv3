"use client";

import { CreditCard, Lock } from "lucide-react";

interface CreditCardFormProps {
  disabled?: boolean;
  packageName?: string;
}

export function CreditCardForm({ disabled = true, packageName }: CreditCardFormProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <CreditCard className="w-8 h-8" />
          <Lock className="w-5 h-5 text-green-400" />
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 mb-2">Kart Numarası</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              disabled={disabled}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-2">Son Kullanma</label>
              <input
                type="text"
                placeholder="AA/YY"
                disabled={disabled}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-2">CVV</label>
              <input
                type="text"
                placeholder="123"
                disabled={disabled}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={3}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-2">Kart Üzerindeki İsim</label>
            <input
              type="text"
              placeholder="AD SOYAD"
              disabled={disabled}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-green-400" />
          <span>256-bit SSL şifreli güvenli ödeme</span>
        </div>
      </div>

      {disabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">
                Bu paket için kredi kartı alımı şu anda kapalıdır
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Lütfen banka havalesi seçeneğini kullanın veya başvurunuz onaylandıktan sonra size gönderilecek ödeme linkini bekleyin.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 pt-2">
        <img src="/images/visa-mastercard.svg" alt="Visa Mastercard" className="h-8 opacity-70" />
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>3D Secure</span>
        </div>
      </div>
    </div>
  );
}
