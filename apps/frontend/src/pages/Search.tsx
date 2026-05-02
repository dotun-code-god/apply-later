import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, SlidersHorizontal, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DashboardSidebar } from "@/components/DashboardSidebar";

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
        <DashboardSidebar active="discover" />

        <main className="w-full">
          <header className="border-b border-border/70 bg-background/80 px-5 py-4 backdrop-blur-xl md:px-8">
            <h1 className="font-display text-3xl font-semibold">Discover Opportunities</h1>
            <p className="text-sm text-muted-foreground">Search, browse trends, and explore opportunity categories.</p>
          </header>

          <div className="space-y-5 px-5 py-6 md:px-8">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/70 bg-card p-4"
            >
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search opportunities"
                  className="h-12 rounded-2xl border-0 bg-secondary pl-11 pr-12 text-[15px] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                />
                {query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-muted"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ) : (
                  <button className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl transition-colors hover:bg-muted">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                      activeCategory === cat
                        ? "gradient-hero text-primary-foreground shadow-glow-sm"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.section>

            {!query ? (
              <div className="grid gap-5 xl:grid-cols-2">
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-2xl border border-border/70 bg-card p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Searches</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => setQuery(search)}
                        className="rounded-xl border border-border bg-secondary px-4 py-2 text-[13px] font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="rounded-2xl border border-border/70 bg-card p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trending</h2>
                  </div>
                  <div className="space-y-1">
                    {trendingSearches.map((item, i) => (
                      <button
                        key={item.label}
                        onClick={() => setQuery(item.label)}
                        className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-secondary"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-[13px] font-bold text-muted-foreground/50">{i + 1}</span>
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.count} saved</span>
                      </button>
                    ))}
                  </div>
                </motion.section>
              </div>
            ) : (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-border/70 bg-card py-12 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <SearchIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="mb-1 text-[15px] font-medium text-foreground">Searching for "{query}"</p>
                <p className="text-[13px] text-muted-foreground">Results will appear here.</p>
              </motion.section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
