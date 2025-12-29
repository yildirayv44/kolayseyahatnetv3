"use client";

import { Building2, CreditCard } from "lucide-react";
import { CreditCardForm } from "./CreditCardForm";

interface CurrencyRates {
  USD: { buying: number; selling: number };
  EUR: { buying: number; selling: number };
}

interface PaymentSummaryProps {
  packageName: string;
  packagePrice: number;
  packageCurrency: string;
  currencyRates: CurrencyRates | null;
  tlAmount: number;
  formatTurkish: (num: number, decimals?: number) => string;
  wantsToPayNow: boolean;
  paymentMethod: string;
  onWantsToPayNowChange: (checked: boolean) => void;
  onPaymentMethodChange: (method: string) => void;
  loading?: boolean;
  onSubmit?: () => void;
}

export function PaymentSummary({
  packageName,
  packagePrice,
  packageCurrency,
  currencyRates,
  tlAmount,
  formatTurkish,
  wantsToPayNow,
  paymentMethod,
  onWantsToPayNowChange,
  onPaymentMethodChange,
  loading = false,
  onSubmit,
}: PaymentSummaryProps) {
  return (
    <div className="space-y-5">
      {/* Package Summary */}
      <div className="card sticky top-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Ödeme Bilgileri</h3>
        
        <div className="space-y-3 pb-4 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Seçilen Paket</p>
            <p className="text-sm font-semibold text-slate-900">{packageName}</p>
          </div>
          
          <div>
            <p className="text-xs text-slate-500">Paket Fiyatı</p>
            <p className="text-2xl font-bold text-primary">
              {formatTurkish(packagePrice, 2)} {packageCurrency}
            </p>
          </div>
        </div>

        {/* Currency Rates */}
        {currencyRates && (
          <div className="py-4 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-3">Güncel Döviz Kurları (TCMB)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">USD:</span>
                <span className="font-semibold text-slate-900">{formatTurkish(currencyRates.USD.selling, 2)} ₺</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">EUR:</span>
                <span className="font-semibold text-slate-900">{formatTurkish(currencyRates.EUR.selling, 2)} ₺</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">* Satış kuru kullanılmaktadır</p>
          </div>
        )}

        {/* TL Amount */}
        {tlAmount > 0 && (
          <div className="py-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg px-4 -mx-4">
            <p className="text-xs text-slate-600 mb-1">Ödenecek Tutar (TL)</p>
            <p className="text-3xl font-bold text-primary">
              {formatTurkish(tlAmount, 2)} ₺
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ({formatTurkish(packagePrice, 2)} {packageCurrency} × {formatTurkish(currencyRates?.[packageCurrency as keyof CurrencyRates]?.selling || 0, 2)} ₺)
            </p>
            <p className="text-xs text-emerald-700 mt-2 font-medium">
              ✓ KDV Dahil
            </p>
          </div>
        )}

        {/* Payment Options */}
        <div className="pt-4 space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="wants_payment_sidebar"
              checked={wantsToPayNow}
              onChange={(e) => onWantsToPayNowChange(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/20"
            />
            <label htmlFor="wants_payment_sidebar" className="text-sm font-medium text-slate-700 cursor-pointer">
              Şimdi ödeme yapmak istiyorum
            </label>
          </div>

          {!wantsToPayNow && (
            <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p>✓ Başvurunuz alındıktan sonra ödeme detayları tarafınıza iletilecektir.</p>
              <p className="text-xs text-slate-500 mt-1">Detaylı online danışmanlık hizmeti sunuyoruz.</p>
            </div>
          )}

          {wantsToPayNow && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div className="text-xs">
                    <p className="font-semibold text-green-900">Güvenli Ödeme</p>
                    <p className="text-green-700 mt-1">
                      256-bit SSL ve 3D Secure ile korunur
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Ödeme Yöntemi:</p>
                
                {/* Bank Transfer */}
                <label className="flex items-start gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_transfer"
                    checked={paymentMethod === "bank_transfer"}
                    onChange={(e) => onPaymentMethodChange(e.target.value)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-slate-900">Banka Havalesi / EFT</span>
                    </div>
                    {paymentMethod === "bank_transfer" && (
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 mt-2 text-xs space-y-1">
                        <p className="font-semibold text-slate-900">Kolay Seyahat Teknoloji Ltd. Şti.</p>
                        <p className="font-mono text-slate-700">TR71 0004 6001 1888 8000 1215 84</p>
                        <p className="text-slate-500 italic mt-2">* Dekont/makbuzu bize iletiniz</p>
                      </div>
                    )}
                  </div>
                </label>

                {/* Credit Card */}
                <label className="flex items-start gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="payment_method"
                    value="credit_card"
                    checked={paymentMethod === "credit_card"}
                    onChange={(e) => onPaymentMethodChange(e.target.value)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-slate-900">Kredi Kartı ile Ödeme</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Credit Card Form - Always visible */}
              {paymentMethod === "credit_card" && (
                <div className="mt-4 space-y-3">
                  <CreditCardForm disabled={true} packageName={packageName} />
                  
                  {/* Refund Policy */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      İade Politikası
                    </h4>
                    <div className="text-xs text-blue-800 space-y-2">
                      <p>• <strong>Konsolosluk Harcı:</strong> Ödendikten sonra iade edilemez.</p>
                      <p>• <strong>Hizmet Bedeli:</strong> İşlemlere başlanmadan önce 7 gün içerisinde iade edilir.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button - Show when payment is selected */}
          {wantsToPayNow && onSubmit && (
            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading || !paymentMethod}
                onClick={onSubmit}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-dark px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Başvuruyu Gönder
                  </span>
                )}
              </button>

              {/* Privacy and KVKK Links */}
              <div className="space-y-2 text-center text-xs text-slate-500">
                <p>
                  Formu göndererek{" "}
                  <a 
                    href="https://www.kolayseyahat.net/bilgi-gizliligi" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline hover:text-primary/80"
                  >
                    Gizlilik Politikası
                  </a>
                  {" "}ve{" "}
                  <a 
                    href="https://www.kolayseyahat.net/kvkk" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline hover:text-primary/80"
                  >
                    KVKK
                  </a>
                  {" "}koşullarını kabul etmiş sayılırsınız.
                </p>
                <p className="text-slate-400">
                  Kişisel verileriniz güvenli bir şekilde saklanır ve üçüncü şahıslarla paylaşılmaz.
                </p>
              </div>

              {/* Invoice and VAT Information */}
              <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Fatura ve Dekont Bilgilendirmesi:</p>
                <ul className="space-y-1 text-slate-600">
                  <li>• Konsolosluk harcı karşılığı <strong>dekont</strong> düzenlenir.</li>
                  <li>• Hizmet bedeli karşılığı <strong>fatura</strong> düzenlenir.</li>
                  <li>• Tüm ücretlere <strong>KDV dahildir</strong>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
