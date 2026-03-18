"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const allBrands = [
  "Prada", "Gucci", "Balenciaga", "Miu Miu", "JW Anderson",
  "Louis Vuitton", "Chanel", "Dior", "Hermès", "Saint Laurent",
  "Burberry", "Versace", "Fendi", "Dolce & Gabbana", "Valentino"
];

const allCategories = [
  { id: "Runway", icon: "👗" },
  { id: "Business", icon: "💼" },
  { id: "Analysis", icon: "📊" },
  { id: "Sustainability", icon: "🌱" },
  { id: "Streetwear", icon: "👟" },
  { id: "High Jewelry", icon: "💎" },
  { id: "Men's", icon: "👔" },
  { id: "Women's", icon: "👚" },
];

function PreferencesContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [name, setName] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!email || !token) {
      setLoading(false);
      return;
    }

    async function fetchPreferences() {
      try {
        const res = await fetch(`/api/preferences?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load preferences");
          return;
        }

        setName(data.data.name || "");
        setSelectedBrands(data.data.brandPreferences || []);
        setSelectedCategories(data.data.categoryPreferences || []);
      } catch (err) {
        setError("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    }

    fetchPreferences();
  }, [email, token]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!email || !token) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          name,
          brandPreferences: selectedBrands,
          categoryPreferences: selectedCategories,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save preferences");
        return;
      }

      setSuccess("Preferences saved successfully!");
    } catch (err) {
      setError("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (!email || !token) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif text-3xl text-[#F5F0E8] mb-4">Invalid Link</h1>
          <p className="text-[#F5F0E8]/50">Please use the link from your subscription email.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 border border-[#C9A962] flex items-center justify-center mx-auto mb-6">
            <span className="font-serif text-[#C9A962] text-2xl">M</span>
          </div>
          <h1 className="font-serif text-4xl text-[#F5F0E8] mb-2">Your Preferences</h1>
          <p className="text-[#F5F0E8]/50">Customize your fashion digest</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#C9A962]/10 border border-[#C9A962]/30 text-[#C9A962] text-sm">
            {success}
          </div>
        )}

        <div className="space-y-8">
          <section>
            <label className="block text-[#F5F0E8] text-sm mb-3">Your Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#F5F0E8]/10 text-[#F5F0E8] placeholder:text-[#F5F0E8]/30 focus:border-[#C9A962] focus:outline-none"
            />
          </section>

          <section>
            <label className="block text-[#F5F0E8] text-sm mb-3">
              Favorite Brands <span className="text-[#F5F0E8]/40">(select multiple)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {allBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-4 py-2 text-sm transition-colors ${
                    selectedBrands.includes(brand)
                      ? "bg-[#C9A962] text-[#0A0A0A]"
                      : "border border-[#F5F0E8]/10 text-[#F5F0E8]/60 hover:border-[#C9A962]/50"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-[#F5F0E8] text-sm mb-3">
              Interests <span className="text-[#F5F0E8]/40">(select multiple)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-4 py-2 text-sm transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? "bg-[#C9A962] text-[#0A0A0A]"
                      : "border border-[#F5F0E8]/10 text-[#F5F0E8]/60 hover:border-[#C9A962]/50"
                  }`}
                >
                  {cat.icon} {cat.id}
                </button>
              ))}
            </div>
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-[#C9A962] text-[#0A0A0A] font-medium hover:bg-[#A88B4A] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>

          <p className="text-center text-[#F5F0E8]/30 text-xs">
            Your preferences will be used to personalize your daily digest.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A962] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <PreferencesContent />
    </Suspense>
  );
}
