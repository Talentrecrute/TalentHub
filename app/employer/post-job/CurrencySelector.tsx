'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

interface CurrencySelectorProps {
  value: string
  onChange: (value: string) => void
}

// Liste complète des devises mondiales
const currencies = [
  { code: "USD", name: "Dollar américain", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "Livre sterling", symbol: "£" },
  { code: "JPY", name: "Yen japonais", symbol: "¥" },
  { code: "CHF", name: "Franc suisse", symbol: "CHF" },
  { code: "CAD", name: "Dollar canadien", symbol: "C$" },
  { code: "AUD", name: "Dollar australien", symbol: "A$" },
  { code: "CNY", name: "Yuan chinois", symbol: "¥" },
  { code: "INR", name: "Roupie indienne", symbol: "₹" },
  { code: "MXN", name: "Peso mexicain", symbol: "$" },
  { code: "BRL", name: "Real brésilien", symbol: "R$" },
  { code: "ZAR", name: "Rand sud-africain", symbol: "R" },
  { code: "RUB", name: "Rouble russe", symbol: "₽" },
  { code: "KRW", name: "Won sud-coréen", symbol: "₩" },
  { code: "SGD", name: "Dollar de Singapour", symbol: "S$" },
  { code: "HKD", name: "Dollar de Hong Kong", symbol: "HK$" },
  { code: "NOK", name: "Couronne norvégienne", symbol: "kr" },
  { code: "SEK", name: "Couronne suédoise", symbol: "kr" },
  { code: "DKK", name: "Couronne danoise", symbol: "kr" },
  { code: "PLN", name: "Zloty polonais", symbol: "zł" },
  { code: "THB", name: "Baht thaïlandais", symbol: "฿" },
  { code: "IDR", name: "Roupie indonésienne", symbol: "Rp" },
  { code: "MYR", name: "Ringgit malaisien", symbol: "RM" },
  { code: "PHP", name: "Peso philippin", symbol: "₱" },
  { code: "CZK", name: "Couronne tchèque", symbol: "Kč" },
  { code: "ILS", name: "Shekel israélien", symbol: "₪" },
  { code: "CLP", name: "Peso chilien", symbol: "$" },
  { code: "NZD", name: "Dollar néo-zélandais", symbol: "NZ$" },
  { code: "TRY", name: "Livre turque", symbol: "₺" },
  { code: "HUF", name: "Forint hongrois", symbol: "Ft" },
  { code: "AED", name: "Dirham des Émirats", symbol: "د.إ" },
  { code: "SAR", name: "Riyal saoudien", symbol: "﷼" },
  { code: "ARS", name: "Peso argentin", symbol: "$" },
  { code: "COP", name: "Peso colombien", symbol: "$" },
  { code: "PEN", name: "Sol péruvien", symbol: "S/" },
  { code: "EGP", name: "Livre égyptienne", symbol: "£" },
  { code: "NGN", name: "Naira nigérian", symbol: "₦" },
  { code: "KES", name: "Shilling kenyan", symbol: "KSh" },
  { code: "MAD", name: "Dirham marocain", symbol: "د.م." },
  { code: "TND", name: "Dinar tunisien", symbol: "د.ت" },
  { code: "VND", name: "Dong vietnamien", symbol: "₫" },
  { code: "PKR", name: "Roupie pakistanaise", symbol: "₨" },
  { code: "BDT", name: "Taka bangladais", symbol: "৳" },
  { code: "UAH", name: "Hryvnia ukrainienne", symbol: "₴" },
  { code: "RON", name: "Leu roumain", symbol: "lei" },
  { code: "BGN", name: "Lev bulgare", symbol: "лв" },
  { code: "HRK", name: "Kuna croate", symbol: "kn" },
  { code: "ISK", name: "Couronne islandaise", symbol: "kr" },
  // Devises africaines et océan Indien
  { code: "MGA", name: "Ariary malgache", symbol: "Ar" },
  { code: "KMF", name: "Franc comorien", symbol: "CF" },
  { code: "MUR", name: "Roupie mauricienne", symbol: "₨" },
  { code: "SCR", name: "Roupie seychelloise", symbol: "₨" },
  { code: "XOF", name: "Franc CFA Ouest-Africain", symbol: "CFA" },
  { code: "XAF", name: "Franc CFA Afrique Centrale", symbol: "FCFA" },
  { code: "DZD", name: "Dinar algérien", symbol: "د.ج" },
  { code: "GHS", name: "Cedi ghanéen", symbol: "₵" },
  { code: "ETB", name: "Birr éthiopien", symbol: "Br" },
  { code: "UGX", name: "Shilling ougandais", symbol: "USh" },
  { code: "TZS", name: "Shilling tanzanien", symbol: "TSh" },
  { code: "RWF", name: "Franc rwandais", symbol: "FRw" },
  { code: "MWK", name: "Kwacha malawien", symbol: "MK" },
  { code: "ZMW", name: "Kwacha zambien", symbol: "ZK" },
  { code: "BWP", name: "Pula botswanais", symbol: "P" },
  { code: "NAD", name: "Dollar namibien", symbol: "$" },
  { code: "SZL", name: "Lilangeni swazi", symbol: "L" },
  { code: "LSL", name: "Loti lesothan", symbol: "L" },
  { code: "MZN", name: "Metical mozambicain", symbol: "MT" },
  { code: "AOA", name: "Kwanza angolais", symbol: "Kz" },
].sort((a, b) => a.name.localeCompare(b.name))

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCurrencies = currencies.filter(currency =>
    currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedCurrency = currencies.find(c => c.code === value)

  const handleSelect = (code: string) => {
    onChange(code)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative">
      <Label htmlFor="currency">Devise</Label>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between mt-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCurrency ? (
          <span className="flex items-center gap-2">
            <span className="font-semibold">{selectedCurrency.code}</span>
            <span className="text-slate-500">-</span>
            <span>{selectedCurrency.name}</span>
            <span className="text-slate-400">({selectedCurrency.symbol})</span>
          </span>
        ) : (
          <span className="text-slate-500">Sélectionner une devise</span>
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-200">
            <Input
              placeholder="Rechercher une devise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredCurrencies.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Aucune devise trouvée
              </div>
            ) : (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => handleSelect(currency.code)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-slate-100 transition-colors
                    ${value === currency.code ? 'bg-teal-50 text-teal-700' : 'text-slate-700'}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-semibold min-w-[3rem]">{currency.code}</span>
                    <span className="text-slate-500">-</span>
                    <span>{currency.name}</span>
                    <span className="text-slate-400">({currency.symbol})</span>
                  </span>
                  {value === currency.code && (
                    <Check className="h-4 w-4 text-teal-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
