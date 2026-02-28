"use client";

import { useState, useCallback } from "react";
import { PostCard } from "./PostCard";

interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  category: { slug: string; name: string };
  source?: { name: string } | null;
  tags: { tag: { id: string; slug: string; name: string } }[];
  viewCount?: number;
}

interface SwipeableFeedProps {
  posts: Post[];
}

export function SwipeableFeed({ posts }: SwipeableFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, posts.length - 1));
  }, [posts.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 60;
    if (dragX > threshold) goPrev();
    else if (dragX < -threshold) goNext();
    setDragX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 60;
    if (dragX > threshold) goPrev();
    else if (dragX < -threshold) goNext();
    setDragX(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragX(0);
    }
  };

  if (posts.length === 0) return null;

  const currentPost = posts[currentIndex];

  return (
    <>
      {/* Desktop: normal scroll */}
      <div className="hidden flex-col gap-6 md:flex">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Mobile: Tinder-style swipe - full screen below sticky header */}
      <div
        className="relative md:hidden"
        style={{ height: "calc(100vh - 53px)", minHeight: 400 }}
      >
        <div
          className="absolute inset-0 touch-pan-y overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="absolute inset-0 transition-transform duration-150 ease-out"
            style={{ transform: `translateX(${dragX}px)` }}
          >
            <div className="h-full w-full overflow-y-auto overflow-x-hidden">
              <PostCard post={currentPost} variant="mobile" />
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
          {posts.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? "w-6 bg-amber-400" : "w-1.5 bg-zinc-600"
              }`}
            />
          ))}
        </div>

        {/* Nav arrows */}
        <div className="absolute bottom-4 left-2 right-2 z-10 flex justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full bg-zinc-800/90 p-2.5 text-zinc-400 shadow-lg hover:bg-zinc-700 hover:text-white disabled:opacity-30"
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-zinc-800/90 p-2.5 text-zinc-400 shadow-lg hover:bg-zinc-700 hover:text-white disabled:opacity-30"
            disabled={currentIndex === posts.length - 1}
            aria-label="Next"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
