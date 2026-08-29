import {
  Skeleton,
  SkeletonCard,
  SkeletonPill,
  SkeletonScreen,
  SkeletonText,
} from "@/components/skeletons/skeleton";

/**
 * One skeleton per storefront page, each mirroring the layout that is about to
 * replace it — the grid it uses, where its media sits, how many columns it
 * breaks to on mobile. A skeleton that matches the arriving page reads as the
 * page loading; a generic stack of grey bars reads as something broken.
 *
 * `index` values run in reading order so the sweep in globals.css crosses the
 * layout as a single wave.
 */

/** The full-bleed banner most pages open with, under the fixed header. */
function HeroBand({
  align = "center",
  pills = 0,
}: {
  align?: "center" | "left";
  pills?: number;
}) {
  const centered = align === "center";
  return (
    <section className="border-b border-black/[0.04] bg-black/[0.02] px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32">
      <div
        className={`mx-auto max-w-4xl space-y-5 ${centered ? "flex flex-col items-center text-center" : ""}`}
      >
        <Skeleton index={0} className="h-4 w-32 rounded-full" />
        <Skeleton index={1} className="h-9 w-[85%] rounded-xl sm:h-12" />
        <Skeleton index={2} className="h-9 w-[60%] rounded-xl sm:h-12" />
        <div className={`w-full max-w-2xl ${centered ? "flex flex-col items-center" : ""}`}>
          <SkeletonText lines={2} index={3} className="w-full" />
        </div>
        {pills > 0 && (
          <div className={`flex flex-wrap gap-3 pt-2 ${centered ? "justify-center" : ""}`}>
            {Array.from({ length: pills }).map((_, i) => (
              <SkeletonPill key={i} index={5 + i} className="w-28 sm:w-32" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CardGrid({
  count,
  cols = "sm:grid-cols-2 lg:grid-cols-3",
  media,
  start = 8,
}: {
  count: number;
  cols?: string;
  media?: string;
  start?: number;
}) {
  return (
    <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} index={start + i * 2} media={media} />
      ))}
    </div>
  );
}

const SHELL = "mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16";

/* ── Home ──────────────────────────────────────────────────────────────── */

export function HomeSkeleton() {
  return (
    <SkeletonScreen label="Loading the homepage">
      {/* Hero: a tall image panel with the headline stacked over it on mobile,
          beside it from lg — matching the homepage's split hero. */}
      <section className="px-4 pb-10 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <Skeleton index={0} className="h-4 w-40 rounded-full" />
            <Skeleton index={1} className="h-11 w-[92%] rounded-xl sm:h-14" />
            <Skeleton index={2} className="h-11 w-[70%] rounded-xl sm:h-14" />
            <SkeletonText lines={3} index={3} className="max-w-xl" />
            <div className="flex flex-wrap gap-3 pt-3">
              <Skeleton index={6} className="h-12 w-40 rounded-full" />
              <Skeleton index={7} className="h-12 w-36 rounded-full" />
            </div>
          </div>
          <Skeleton
            index={4}
            className="mx-auto aspect-[4/3] w-full max-w-md rounded-2xl sm:aspect-square lg:aspect-[4/5]"
          />
        </div>
      </section>

      {/* Product rail */}
      <section className={SHELL}>
        <div className="mb-7 flex items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton index={8} className="h-7 w-52 rounded-lg sm:h-8 sm:w-64" />
            <Skeleton index={9} className="h-3.5 w-40 rounded-full" />
          </div>
          <Skeleton index={10} className="hidden h-10 w-28 rounded-full sm:block" />
        </div>
        <CardGrid count={4} cols="grid-cols-2 lg:grid-cols-4" media="aspect-square" start={11} />
      </section>

      {/* Consultation / courses band */}
      <section className="bg-black/[0.02] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <Skeleton index={20} className="h-7 w-64 rounded-lg sm:h-8 sm:w-80" />
            <Skeleton index={21} className="h-3.5 w-72 rounded-full" />
          </div>
          <CardGrid count={3} media="aspect-[16/10]" start={22} />
        </div>
      </section>

      {/* Gallery strip */}
      <section className={SHELL}>
        <Skeleton index={28} className="mx-auto mb-8 h-7 w-56 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} index={29 + i} className="aspect-video w-full rounded-2xl" />
          ))}
        </div>
      </section>
    </SkeletonScreen>
  );
}

/* ── Courses ───────────────────────────────────────────────────────────── */

export function CoursesSkeleton() {
  return (
    <SkeletonScreen label="Loading courses">
      <HeroBand pills={3} />
      <section className={SHELL}>
        <CardGrid count={6} media="aspect-[16/10]" />
      </section>
    </SkeletonScreen>
  );
}

export function CourseDetailSkeleton() {
  return (
    <SkeletonScreen label="Loading this course">
      <section className="border-b border-black/[0.04] bg-black/[0.02] px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-5">
            <Skeleton index={0} className="h-4 w-28 rounded-full" />
            <Skeleton index={1} className="h-9 w-[90%] rounded-xl sm:h-11" />
            <Skeleton index={2} className="h-9 w-[55%] rounded-xl sm:h-11" />
            <SkeletonText lines={3} index={3} className="max-w-2xl" />
            <div className="flex flex-wrap gap-3 pt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonPill key={i} index={6 + i} />
              ))}
            </div>
          </div>
          {/* Enrolment card — sticky beside the content from lg */}
          <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/70 p-5 shadow-sm">
            <Skeleton index={9} className="aspect-video w-full rounded-xl" />
            <Skeleton index={10} className="h-8 w-32 rounded-lg" />
            <SkeletonText lines={2} index={11} />
            <Skeleton index={13} className="h-12 w-full rounded-full" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-7">
            {Array.from({ length: 3 }).map((_, s) => (
              <div key={s} className="space-y-4">
                <Skeleton index={14 + s * 4} className="h-6 w-48 rounded-lg" />
                <SkeletonText lines={4} index={15 + s * 4} />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} index={26 + i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </SkeletonScreen>
  );
}

/* ── Shop ──────────────────────────────────────────────────────────────── */

export function ShopSkeleton() {
  return (
    <SkeletonScreen label="Loading the shop">
      <HeroBand />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Filters: horizontally scrollable on mobile, inline from sm */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Skeleton index={8} className="h-11 w-full rounded-full sm:w-72" />
          <div className="flex flex-1 flex-wrap gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonPill key={i} index={9 + i} className="w-24" />
            ))}
          </div>
          <Skeleton index={13} className="hidden h-11 w-36 rounded-full lg:block" />
        </div>
        <Skeleton index={14} className="mb-6 h-3.5 w-48 rounded-full" />
        <CardGrid
          count={8}
          cols="grid-cols-2 lg:grid-cols-4"
          media="aspect-[3/4]"
          start={15}
        />
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} index={32 + i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
      </section>
    </SkeletonScreen>
  );
}

/**
 * Product detail sits outside the storefront layout and renders its own header,
 * so this reserves the header strip itself rather than inheriting one.
 */
export function ProductDetailSkeleton() {
  return (
    <SkeletonScreen label="Loading this product">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-24 sm:px-6 sm:pt-28">
        <Skeleton index={0} className="mb-6 h-3.5 w-56 rounded-full" />
        <div className="grid gap-6 sm:gap-10 lg:grid-cols-[480px_1fr]">
          {/* Gallery: main frame plus thumbnail rail */}
          <div className="space-y-3">
            <Skeleton index={1} className="aspect-square w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} index={2 + i} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
          </div>
          {/* Purchase panel */}
          <div className="space-y-5">
            <Skeleton index={6} className="h-4 w-24 rounded-full" />
            <Skeleton index={7} className="h-9 w-[85%] rounded-xl sm:h-10" />
            <div className="flex items-center gap-3">
              <Skeleton index={8} className="h-8 w-28 rounded-lg" />
              <Skeleton index={9} className="h-5 w-20 rounded-full" />
            </div>
            <SkeletonText lines={4} index={10} />
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton index={14} className="h-12 w-32 rounded-full" />
              <Skeleton index={15} className="h-12 flex-1 rounded-full sm:flex-none sm:w-48" />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} index={16 + i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        {/* Description tabs */}
        <div className="mt-14 space-y-5">
          <div className="flex gap-3 border-b border-black/[0.06] pb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} index={20 + i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
          <SkeletonText lines={5} index={23} />
        </div>
      </div>
    </SkeletonScreen>
  );
}

/* ── Consultation ──────────────────────────────────────────────────────── */

export function ConsultationSkeleton() {
  return (
    <SkeletonScreen label="Loading consultations">
      <HeroBand pills={4} />
      <section className={SHELL}>
        <CardGrid count={6} media="aspect-[16/10]" />
      </section>
      {/* Practitioner panel */}
      <section className="bg-black/[0.02] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
          <Skeleton index={22} className="aspect-[4/5] w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton index={23} className="h-8 w-64 rounded-lg" />
            <Skeleton index={24} className="h-4 w-48 rounded-full" />
            <SkeletonText lines={4} index={25} />
            <div className="flex flex-wrap gap-2.5 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonPill key={i} index={29 + i} className="w-32" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </SkeletonScreen>
  );
}

/* ── Blog ──────────────────────────────────────────────────────────────── */

export function BlogsSkeleton() {
  return (
    <SkeletonScreen label="Loading the blog">
      <HeroBand />
      <section className={SHELL}>
        {/* Featured post: media and copy side by side from md */}
        <div className="mb-12 grid overflow-hidden rounded-2xl border border-black/[0.06] bg-white/70 shadow-sm md:grid-cols-2">
          <Skeleton index={8} className="aspect-[16/10] w-full rounded-none md:aspect-auto md:h-full" />
          <div className="space-y-4 p-6 sm:p-8">
            <Skeleton index={9} className="h-6 w-28 rounded-full" />
            <Skeleton index={10} className="h-7 w-[90%] rounded-lg" />
            <Skeleton index={11} className="h-7 w-[65%] rounded-lg" />
            <SkeletonText lines={3} index={12} />
            <Skeleton index={15} className="h-3.5 w-40 rounded-full" />
          </div>
        </div>
        <CardGrid count={6} cols="sm:grid-cols-2 lg:grid-cols-3" media="aspect-[16/10]" start={16} />
      </section>
    </SkeletonScreen>
  );
}

export function BlogDetailSkeleton() {
  return (
    <SkeletonScreen label="Loading this article">
      <article className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl space-y-5">
          <Skeleton index={0} className="h-6 w-28 rounded-full" />
          <Skeleton index={1} className="h-10 w-full rounded-xl sm:h-12" />
          <Skeleton index={2} className="h-10 w-[70%] rounded-xl sm:h-12" />
          <div className="flex items-center gap-3 pt-1">
            <Skeleton index={3} className="h-10 w-10 rounded-full" />
            <Skeleton index={4} className="h-3.5 w-44 rounded-full" />
          </div>
        </div>
        <Skeleton index={5} className="my-9 aspect-[16/9] w-full rounded-3xl" />
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <div className="space-y-7">
            {Array.from({ length: 3 }).map((_, s) => (
              <div key={s} className="space-y-3.5">
                <SkeletonText lines={4} index={6 + s * 5} />
                {s === 1 && <Skeleton index={20} className="aspect-[16/9] w-full rounded-2xl" />}
              </div>
            ))}
          </div>
          <aside className="mt-10 space-y-4 lg:mt-0">
            <Skeleton index={22} className="h-6 w-36 rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton index={23 + i} className="h-16 w-20 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton index={24 + i} className="h-3.5 w-full rounded-full" />
                  <Skeleton index={25 + i} className="h-3.5 w-[70%] rounded-full" />
                </div>
              </div>
            ))}
          </aside>
        </div>
      </article>
    </SkeletonScreen>
  );
}

/* ── Gallery ───────────────────────────────────────────────────────────── */

export function GallerySkeleton() {
  // Uneven heights, because the real gallery is a masonry — equal tiles would
  // reflow visibly the moment the images land.
  const heights = ["h-56", "h-72", "h-48", "h-64", "h-80", "h-52", "h-60", "h-44", "h-72"];
  return (
    <SkeletonScreen label="Loading the gallery">
      <HeroBand />
      <section className={SHELL}>
        <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
          {heights.map((h, i) => (
            <Skeleton
              key={i}
              index={8 + i}
              className={`${h} w-full break-inside-avoid rounded-2xl`}
            />
          ))}
        </div>
      </section>
    </SkeletonScreen>
  );
}

/* ── About ─────────────────────────────────────────────────────────────── */

export function AboutSkeleton() {
  return (
    <SkeletonScreen label="Loading the about page">
      <HeroBand />
      {/* Founder */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <Skeleton index={8} className="aspect-[3/4] w-full rounded-3xl" />
          <div className="space-y-4">
            <Skeleton index={9} className="h-8 w-60 rounded-lg" />
            <Skeleton index={10} className="h-4 w-44 rounded-full" />
            <SkeletonText lines={5} index={11} />
          </div>
        </div>
      </section>
      {/* Values */}
      <section className="bg-black/[0.02] px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <Skeleton index={17} className="mx-auto mb-9 h-8 w-56 rounded-lg" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="space-y-3 rounded-2xl border border-black/[0.06] bg-white/70 p-6 shadow-sm"
              >
                <Skeleton index={18 + i} className="h-12 w-12 rounded-2xl" />
                <Skeleton index={19 + i} className="h-5 w-32 rounded-lg" />
                <SkeletonText lines={2} index={20 + i} />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2.5">
              <Skeleton index={26 + i} className="h-10 w-20 rounded-lg" />
              <Skeleton index={27 + i} className="h-3.5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </SkeletonScreen>
  );
}

/* ── Contact ───────────────────────────────────────────────────────────── */

export function ContactSkeleton() {
  return (
    <SkeletonScreen label="Loading the contact page">
      <HeroBand />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="space-y-5 rounded-3xl border border-black/[0.06] bg-white/70 p-6 shadow-sm sm:p-8 lg:col-span-3">
            <Skeleton index={8} className="h-7 w-48 rounded-lg" />
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton index={9 + i} className="h-3.5 w-24 rounded-full" />
                  <Skeleton index={10 + i} className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton index={12 + i} className="h-3.5 w-28 rounded-full" />
                <Skeleton index={13 + i} className="h-12 w-full rounded-xl" />
              </div>
            ))}
            <div className="space-y-2">
              <Skeleton index={15} className="h-3.5 w-24 rounded-full" />
              <Skeleton index={16} className="h-36 w-full rounded-xl" />
            </div>
            <Skeleton index={17} className="h-12 w-44 rounded-full" />
          </div>
          {/* Contact details */}
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-black/[0.06] bg-white/70 p-5 shadow-sm"
              >
                <Skeleton index={18 + i} className="h-11 w-11 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton index={19 + i} className="h-4 w-28 rounded-full" />
                  <Skeleton index={20 + i} className="h-3.5 w-[75%] rounded-full" />
                </div>
              </div>
            ))}
            <Skeleton index={23} className="aspect-[4/3] w-full rounded-2xl" />
          </div>
        </div>
      </section>
    </SkeletonScreen>
  );
}

/* ── Generic ───────────────────────────────────────────────────────────── */

/**
 * Fallback for the storefront routes without a bespoke skeleton (cart, account,
 * the policy pages). It exists so those routes never inherit the homepage
 * skeleton from the segment above them, which would promise the wrong page.
 */
export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <SkeletonScreen label={label}>
      <HeroBand />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, s) => (
            <div key={s} className="space-y-4">
              <Skeleton index={8 + s * 5} className="h-6 w-52 rounded-lg" />
              <SkeletonText lines={4} index={9 + s * 5} />
            </div>
          ))}
        </div>
      </section>
    </SkeletonScreen>
  );
}

/* ── In-place grids ────────────────────────────────────────────────────────
   For the client pages that fetch their own data: the hero and filters are
   already on screen, so only the results area is still waiting. Swapping the
   whole page for a skeleton there would throw away chrome the visitor can
   already see and interact with. */

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      <CardGrid count={count} cols="grid-cols-2 lg:grid-cols-4" media="aspect-[3/4]" start={0} />
    </div>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-hidden="true">
      <CardGrid count={count} media="aspect-[16/10]" start={0} />
    </div>
  );
}

export function GalleryMasonrySkeleton({ count = 9 }: { count?: number }) {
  const heights = ["h-56", "h-72", "h-48", "h-64", "h-80", "h-52", "h-60", "h-44", "h-72"];
  return (
    <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          index={i}
          className={`${heights[i % heights.length]} w-full break-inside-avoid rounded-2xl`}
        />
      ))}
    </div>
  );
}
