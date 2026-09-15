import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SearchBox } from "@/components/search-box";
import { VerseCard } from "@/components/verse-card";
import { useBible } from "@/components/bible-provider";
import { searchLocal } from "@/lib/bible/search";
import { useSeekStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { verseOfTheDay } from "@/data/daily";
import {
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  Compass,
  Github,
  Mail,
  Search,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  { q: "begot", label: "begot" },
  { q: "walk on water", label: "walk on water" },
  { q: "comfort when I am afraid", label: "comfort when afraid" },
  { q: "prodigal son", label: "prodigal son" },
  { q: "valley of the shadow", label: "valley of the shadow" },
];

const FAQ = [
  {
    q: "What is Seek?",
    a: "Seek is a fast, free way to find any verse in the King James Bible. Type a fragment, a story, or even a feeling ΓÇö and Seek shows you the passage.",
  },
  {
    q: "Which Bible version does Seek use?",
    a: "Seek uses the King James Version (KJV), one of the most widely read English translations of the Bible.",
  },
  {
    q: "Does Seek work offline?",
    a: "Yes. The full KJV text is stored locally in your browser, so searches and reading work without an internet connection.",
  },
  {
    q: "Can I save verses?",
    a: "Yes. Create a free account and bookmark any verse. Your saved verses sync across devices and are always available on the Saved tab.",
  },
  {
    q: "Is Seek free?",
    a: "Yes. Seek is completely free, with no ads, no paywalls, and no account required to start searching.",
  },
];

export const Route = createFileRoute("/")({ component: Home });

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mt-8">
      <p className="px-1 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">
        Frequently asked
      </p>
      <div className="mt-3 glass-group rounded-[22px]">
        {FAQ.map((item, i) => (
          <div key={item.q} className={cn("px-4", i > 0 && "border-t border-line")}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between py-3.5 text-left font-sans text-[14px] font-medium text-ink"
            >
              {item.q}
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-faint transition-transform duration-200",
                  open === i && "rotate-180",
                )}
              />
            </button>
            {open === i && (
              <p className="pb-4 font-sans text-[13px] leading-relaxed text-muted">
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const daily = verseOfTheDay();
  const { bible, ready } = useBible();
  const recent = useSeekStore((s) => s.recent);
  const rememberQuery = useSeekStore((s) => s.rememberQuery);
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const [live, setLive] = useState("");

  const preview = useMemo(() => {
    if (!bible || live.trim().length < 3) return [];
    return searchLocal(bible, live, 4);
  }, [bible, live]);

  return (
    <div className="pt-3">
      <section>
        <p className="font-sans text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
          King James Bible
        </p>
        <h1 className="mt-2 font-serif text-[2.8rem] leading-[1.12] font-medium tracking-tight text-ink">
          Find the verse<br /> you remembered half
        </h1>
        <p className="mt-3 max-w-[22rem] font-sans text-[15px] leading-relaxed text-muted">
          A fragment, a feeling, or a story. Seek finds the place in Scripture.
        </p>
        <div className="mt-5">
          <SearchBox
            autoFocus
            onSubmitQuery={(q) => rememberQuery(q)}
            onValueChange={setLive}
          />
        </div>
        <div className="hide-scrollbar mt-3.5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.q}
              type="button"
              onClick={() => {
                rememberQuery(ex.q);
                void navigate({ to: "/search", search: { q: ex.q } });
              }}
              className="glass-thin shrink-0 rounded-full px-3.5 py-2 font-sans text-[13px] text-muted transition-transform duration-150 active:scale-[0.96] hover:text-ink"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </section>

      {ready && preview.length > 0 && (
        <section className="mt-7 space-y-3">
          <p className="px-1 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">
            Instant matches
          </p>
          {preview.map((hit) => (
            <VerseCard
              key={hit.verse.i}
              verse={hit.verse}
              matched={hit.matched}
              reason={hit.reason}
              kind={hit.kind === "book" ? "reference" : hit.kind}
              query={live}
            />
          ))}
        </section>
      )}

      {hydrated && recent.length > 0 && (
        <section className="mt-8">
          <p className="mb-2 px-1 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">
            Recent
          </p>
          <div className="glass-group rounded-[22px]">
            {recent.map((q) => (
              <Link
                key={q}
                to="/search"
                search={{ q }}
                className="glass-row flex min-h-12 items-center justify-between px-4 py-3 font-sans text-[15px] text-ink hover:bg-ink/5"
              >
                <span className="truncate">{q}</span>
                <ChevronRight className="size-4 shrink-0 text-faint" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <p className="px-1 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">
          Today
        </p>
        <Link
          to="/read/$book/$chapter"
          params={{ book: daily.slug, chapter: String(daily.chapter) }}
          search={{ q: undefined }}
          hash={`v${daily.verse}`}
          className="glass mt-2 block rounded-[28px] p-5 transition-transform duration-150 active:scale-[0.99]"
        >
          <p className="font-serif text-lg font-medium text-ink">
            {daily.book} {daily.chapter}:{daily.verse}
          </p>
          <p className="mt-3 font-serif text-[17px] leading-relaxed text-ink">{daily.text}</p>
        </Link>
      </section>

      <section className="mt-8 mb-4">
        <Link
          to="/books"
          className="glass flex min-h-14 items-center justify-between rounded-[22px] px-5 py-3.5 transition-transform duration-150 active:scale-[0.99]"
        >
          <div>
            <p className="font-serif text-lg font-medium text-ink">All 66 books</p>
            <p className="mt-0.5 font-sans text-[13px] text-muted">Open any chapter</p>
          </div>
          <ChevronRight className="size-5 text-faint" />
        </Link>
      </section>

      <section className="mt-8">
        <p className="px-1 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">
          How Seek works
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: Search, step: "Search", desc: "Type a phrase, word, or feeling" },
            { icon: Compass, step: "Find", desc: "Instant matches across 66 books" },
            { icon: BookOpenCheck, step: "Read", desc: "Open any chapter in a clean reader" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="glass rounded-[22px] p-4 text-center">
                <Icon className="mx-auto size-6 text-forest" strokeWidth={1.8} />
                <p className="mt-2 font-sans text-[13px] font-medium text-ink">{item.step}</p>
                <p className="mt-1 font-sans text-[11px] leading-snug text-muted">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <FaqSection />

      <section className="mt-8 rounded-[28px] p-5">
        <p className="text-center font-sans text-[13px] text-muted">
          Built for anyone who searches the Bible.
        </p>
        <p className="mt-2 text-center font-sans text-[13px] leading-relaxed text-faint">
          Whether you remember a verse word for word, or just the feeling it
          gives  you  Seek finds it.
        </p>
      </section>

      <footer className="mt-8 mb-6 border-t border-line pt-6">
        <p className="text-center font-serif text-lg font-medium text-ink">
          Seek
        </p>
        <p className="mt-2 text-center font-sans text-[14px] tracking-[0.14em] text-faint uppercase">
          King James Bible
        </p>
        <p className="mt-1 text-center font-sans text-[12px] tracking-[0.14em] text-faint uppercase">
          version
        </p>
        <div className="mt-5 flex justify-center gap-4">
          <a
            href="https://github.com/David-oy/get.stack"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="glass flex size-10 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.95]"
          >
            <Github className="size-5 text-ink" />
          </a>
          <a
            href="https://x.com/vijayyyyy_7"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="glass flex size-10 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.95]"
          >
            <Twitter className="size-5 text-ink" />
          </a>
          <a
            href="mailto:vijay.peddenti434@gmail.com"
            aria-label="Email"
            className="glass flex size-10 items-center justify-center rounded-full transition-transform duration-150 active:scale-[0.95]"
          >
            <Mail className="size-5 text-ink" />
          </a>
        </div>
        <p className="mt-5 text-center font-sans text-[15px] text-faint">
          Made for the love for
        </p>
        <p className="mt-1 text-center font-sans text-[14px] tracking-[0.14em] text-faint uppercase">
          the word of LORD
        </p>

        <div className="relative mt-5 overflow-hidden rounded-[32px] bg-banner shadow-soft">
          <img
            src="/banner-day.webp"
            alt=""
            width={1008}
            height={627}
            decoding="async"
            className="block w-full dark:hidden"
          />
          <img
            src="/banner-night.webp"
            alt=""
            width={1008}
            height={627}
            decoding="async"
            className="hidden w-full dark:block"
          />
          <div className="absolute inset-x-3 top-3 z-10">
            <div className="glass glass-strong mx-auto max-w-72 rounded-[22px] px-4 py-3 text-center">
              <p className="font-serif text-[15px] leading-snug font-medium text-ink">
                &ldquo;Thy word is a lamp unto my feet.&rdquo;
              </p>
              <p className="mt-1.5 font-sans text-[10px] tracking-[0.16em] text-muted uppercase">
                Psalm 119 · 105
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/books"
          className="glass glass-strong relative z-10 mx-auto mt-4 flex w-fit items-center gap-2 rounded-full px-4 py-2.5 transition-transform duration-150 active:scale-[0.96]"
        >
          <BookOpenCheck className="size-6 text-forest" strokeWidth={1.8} />
          <span className="font-sans text-[12px] font-medium tracking-wide text-ink">
            Seek the Word
          </span>
        </Link>
      </footer>
    </div>
  );
}
