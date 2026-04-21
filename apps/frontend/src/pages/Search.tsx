import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, SlidersHorizontal, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";

const recentSearches = ["Chevening", "Google", "Fulbright", "TechStars"];
const categories = ["All", "Scholarships", "Jobs", "Grants", "Fellowships", "Programs"];

const trendingSearches = [
  { label: "Chevening 2026", count: "2.3k" },
  { label: "Google Summer of Code", count: "1.8k" },
  { label: "Fulbright Program", count: "1.4k" },
  { label: "Rhodes Scholarship", count: "980" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="px-5 pt-5 pb-3 sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border"
      >
        <h1 className="text-[22px] font-bold text-foreground mb-3">Discover</h1>

        {/* Search input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search opportunities..."
            className="pl-11 pr-12 h-12 text-[15px] rounded-2xl bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-muted flex items-center justify-center touch-manipulation"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          ) : (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors touch-manipulation">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Category chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-5 pt-4 pb-3"
      >
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all touch-manipulation flex-shrink-0 ${
                activeCategory === cat
                  ? "gradient-hero text-primary-foreground shadow-glow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      <main className="px-5 pb-28">
        {!query ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-6"
          >
            {/* Recent searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Recent
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="px-4 py-2 rounded-xl bg-secondary border border-border text-[13px] font-medium text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all touch-manipulation"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Trending
                </h3>
              </div>
              <div className="space-y-1">
                {trendingSearches.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={() => setQuery(item.label)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors touch-manipulation"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-[13px] font-bold text-muted-foreground/50">
                        {i + 1}
                      </span>
                      <span className="text-[14px] font-medium text-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[12px] text-muted-foreground">{item.count} saved</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-[15px] font-medium text-foreground mb-1">
              Searching for "{query}"
            </p>
            <p className="text-[13px] text-muted-foreground">
              Results will appear here
            </p>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
