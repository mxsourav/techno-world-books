import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ListOrdered,
  FileText,
  Info,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Zap,
  BookMarked,
  GraduationCap,
} from 'lucide-react';
import { formatINR } from '@/utils/helpers';
import { BookCover } from '@/components/BookCover';
import type { Book } from '@/types';

interface SampleReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author: string;
    publisher?: string | { name?: string };
    edition?: string;
    price: number;
    mrp?: number;
    coverUrl?: string;
    coverImage?: string;
    description?: string;
    pages?: number;
    isbn13?: string;
    subject?: string;
    samplePdfUrl?: string;
  };
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export const SampleReaderModal: React.FC<SampleReaderModalProps> = ({
  isOpen,
  onClose,
  book,
  onAddToCart,
  onBuyNow,
}) => {
  const [activeTab, setActiveTab] = useState<'toc' | 'sample' | 'overview' | 'cover'>('toc');
  const [samplePage, setSamplePage] = useState<number>(1);

  if (!isOpen) return null;

  const publisherName =
    typeof book.publisher === 'string'
      ? book.publisher
      : book.publisher?.name || 'Techno World Publications';

  const discountPercent =
    book.mrp && book.mrp > book.price
      ? Math.round(((book.mrp - book.price) / book.mrp) * 100)
      : null;

  const defaultToc = [
    { unit: 'Unit 1', title: 'Foundations and Theoretical Principles', pages: '1 – 48' },
    { unit: 'Unit 2', title: 'Analytical Methods and Problem Formulations', pages: '49 – 112' },
    { unit: 'Unit 3', title: 'Core Algorithmic and Empirical Frameworks', pages: '113 – 186' },
    { unit: 'Unit 4', title: 'Advanced Applications and Case Studies', pages: '187 – 274' },
    { unit: 'Unit 5', title: 'University Examination Solved Model Papers', pages: '275 – 340' },
    { unit: 'Appendix', title: 'Formulas, Tables, and Key References', pages: '341 – 356' },
  ];

  const totalSamplePages = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] max-h-[820px] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <BookOpen className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                  Look Inside · Sample Reader
                </span>
                {book.edition && (
                  <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-700 uppercase">
                    {book.edition}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {book.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0"
            title="Close sample reader"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 bg-white shrink-0 overflow-x-auto">
          {[
            { id: 'toc', label: 'Table of Contents', icon: ListOrdered },
            { id: 'sample', label: 'Sample Reading', icon: FileText },
            { id: 'overview', label: 'Book Overview', icon: Info },
            { id: 'cover', label: 'Front & Back Cover', icon: BookMarked },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: TABLE OF CONTENTS */}
          {activeTab === 'toc' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ListOrdered className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Syllabus & Table of Contents</h4>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Academic curriculum structure designed according to latest MAKAUT, Calcutta University, and technical board standards.
                </p>

                <div className="mt-4 divide-y divide-slate-100">
                  {defaultToc.map((chapter, idx) => (
                    <div key={idx} className="flex items-start justify-between py-3 gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-700 shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
                            {chapter.unit}
                          </div>
                          <div className="text-xs font-semibold text-slate-800">
                            {chapter.title}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-slate-400 shrink-0">
                        pp. {chapter.pages}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAMPLE READING */}
          {activeTab === 'sample' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-600">
                  Sample Page {samplePage} of {totalSamplePages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={samplePage <= 1}
                    onClick={() => setSamplePage((p) => Math.max(1, p - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={samplePage >= totalSamplePages}
                    onClick={() => setSamplePage((p) => Math.min(totalSamplePages, p + 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Reader Paper Sheet */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4 font-serif text-slate-800 min-h-[460px]">
                {samplePage === 1 && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-emerald-700">
                        Chapter 1 · Introductory Principles
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-1 font-sans">
                        1.1 Fundamental Axioms and Analytical Foundations
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                      Academic study in this domain necessitates a rigorous mathematical and empirical understanding. The principles established in this text are structured to provide both conceptual depth and practical problem-solving capability.
                    </p>
                    <div className="rounded-lg bg-emerald-50/60 border border-emerald-200/70 p-4 font-sans text-xs">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-700" />
                        Key Theorem & Formula
                      </div>
                      <p className="mt-1 text-emerald-800 font-mono">
                        Φ(x) = ∑ [ w_i · ψ_i(x) ] + ε_0, where ∀ i ∈ {`{1, ..., n}`}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                      As demonstrated across subsequent derivations, students must verify the boundary conditions prior to applying numerical approximations. Examination questions frequently evaluate these transitional proofs.
                    </p>
                  </div>
                )}

                {samplePage === 2 && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-emerald-700">
                        Chapter 1 · Solved University Examples
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-1 font-sans">
                        1.2 Model Problem Solutions with Step-by-Step Working
                      </h2>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 font-sans text-xs">
                      <span className="font-bold text-slate-900">Example 1.4:</span>
                      <p className="mt-1 text-slate-700">
                        Determine the characteristic response for the system when excited by a step input of magnitude 10 units. Assume zero initial energy conditions.
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                      <b>Step 1:</b> Formulate the differential representation in the Laplace domain.
                    </p>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                      <b>Step 2:</b> Apply partial fraction expansion to identify individual pole contributions.
                    </p>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                      <b>Step 3:</b> Invert the transformation to compute the time-domain response: y(t) = 10 · [1 - exp(-2t) · cos(4t)].
                    </p>
                  </div>
                )}

                {samplePage === 3 && (
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="text-[11px] font-sans font-bold uppercase tracking-widest text-emerald-700">
                        Chapter Review · Key Concepts
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mt-1 font-sans">
                        1.3 Summary and Examination Review Points
                      </h2>
                    </div>
                    <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-700">
                      <li>Linearity and superposition principles hold strictly under continuous-time regimes.</li>
                      <li>Root locus paths illustrate stability transitions as parameter values vary.</li>
                      <li>Frequency response margins provide robustness criteria under noise interference.</li>
                      <li>Standard IEEE/ISO dimensional conventions must be maintained throughout technical solutions.</li>
                    </ul>
                  </div>
                )}

                {samplePage === 4 && (
                  <div className="space-y-4 text-center py-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mx-auto">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-sans">
                      End of Free Online Sample
                    </h3>
                    <p className="text-xs text-slate-600 font-sans max-w-sm mx-auto">
                      Purchase the full printed edition to access all chapters, complete university solved papers, and exhaustive exercise sets.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={onBuyNow}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 font-sans transition-all"
                      >
                        <Zap className="h-4 w-4" />
                        Buy Complete Book for {formatINR(book.price)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BOOK OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Info className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Bibliographic Specifications</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Author:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{book.author}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Publisher:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{publisherName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Edition:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{book.edition || 'Current Edition'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">ISBN-13:</span>
                    <div className="font-mono font-semibold text-slate-800 mt-0.5">{book.isbn13 || 'Available on Request'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Subject / Branch:</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{book.subject || 'Engineering & Sciences'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Extent (Pages):</span>
                    <div className="font-semibold text-slate-800 mt-0.5">{book.pages ? `${book.pages} Pages` : 'Comprehensive Volume'}</div>
                  </div>
                </div>

                {book.description && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Description:</span>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: COVER VIEW */}
          {activeTab === 'cover' && (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative w-64 max-w-xs rounded-xl overflow-hidden shadow-lg bg-white">
                <BookCover
                  book={book as any as Book}
                  className="w-full h-auto text-sm"
                />
              </div>
              <p className="mt-3 text-xs text-slate-500 font-medium">
                Official publication cover published by {publisherName}
              </p>
            </div>
          )}

        </div>

        {/* Bottom Persistent Action Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-white shrink-0">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-slate-900">
              {formatINR(book.price)}
            </span>
            {book.mrp && book.mrp > book.price && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(book.mrp)}
                </span>
                {discountPercent && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    {discountPercent}% OFF
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAddToCart}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5 text-slate-600" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              onClick={onBuyNow}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SampleReaderModal;
