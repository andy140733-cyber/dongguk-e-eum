"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Notice, NoticeCategory } from "@/types";
import {
  NoticeCard,
  SearchAndFilterBar,
  EmptyStateBox,
  DemoInfoBanner,
} from "@/components/common/Cards";
import {
  Megaphone,
  Plus,
  ExternalLink,
  Calendar,
  Pin,
  X,
  CheckCircle2,
} from "lucide-react";

const NOTICE_CATEGORIES: ("전체" | NoticeCategory)[] = [
  "전체",
  "학교 공지",
  "교육학과 공지",
  "학사 일정",
  "장학 및 지원",
  "교직 관련 안내",
];

export default function NoticesPage() {
  const { notices, createNotice, currentRole } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // 새 공지 작성 폼 상태
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<NoticeCategory>("교육학과 공지");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPinned, setNewPinned] = useState(false);
  const [newUrl, setNewUrl] = useState("https://www.dongguk.edu");

  const filteredNotices = notices
    .filter((n) => {
      const matchCat =
        selectedCategory === "전체" || n.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    createNotice({
      title: newTitle.trim(),
      category: newCategory,
      summary: newSummary.trim() || newContent.trim().slice(0, 80),
      content: newContent.trim(),
      isPinned: newPinned,
      officialUrl: newUrl.trim() || "https://www.dongguk.edu",
    });
    setNewTitle("");
    setNewSummary("");
    setNewContent("");
    setNewPinned(false);
    setIsWriteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              학교 및 교육학과 공지사항
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            학교 공지, 교육학과 공지, 학사 일정, 장학 및 교직 안내를 카테고리별로 확인하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 self-start sm:self-auto shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          관리자 공지 작성 UI {currentRole !== "admin" && "(데모 체험 가능)"}
        </button>
      </div>

      <DemoInfoBanner
        title="모든 공지사항은 프로토타입 시연을 위한 [예시 데이터]입니다."
        description="실제 동국대학교 및 사범대학 교육학과 공지로 오해하지 않도록 각 게시물에 '예시 데이터' 표기를 의무 적용했으며, 무단 웹 크롤링을 수행하지 않습니다."
        variant="amber"
      />

      {/* 검색 및 카테고리 필터 */}
      <SearchAndFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="공지 제목, 키워드(예: 학술제, 교육봉사, 다전공, 장학)를 검색하세요..."
        categories={NOTICE_CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 공지 목록 */}
      {filteredNotices.length === 0 ? (
        <EmptyStateBox
          title="조건에 맞는 공지사항이 없습니다"
          description="다른 카테고리를 선택하거나 검색어를 초기화해 보세요."
          actionLabel="필터 초기화"
          onAction={() => {
            setSelectedCategory("전체");
            setSearchQuery("");
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onSelect={(n) => setSelectedNotice(n)}
            />
          ))}
        </div>
      )}

      {/* 공지 상세 보기 모달 */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {selectedNotice.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-orange-600 text-white text-xs font-bold">
                    <Pin className="w-3 h-3" /> 중요 고정
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs font-bold">
                  {selectedNotice.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-bold">
                  예시 데이터 (실제 학교 공지 아님)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {selectedNotice.title}
            </h2>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
              <span>작성자: {selectedNotice.authorName}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> 작성일: {selectedNotice.createdAt}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
              {selectedNotice.content}
            </div>

            <div className="p-4 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  공식 출처 링크 안내
                </p>
                <p className="text-slate-500">
                  실제 학사·교직·장학 공지는 반드시 동국대학교 공식 홈페이지에서 확인하세요.
                </p>
              </div>
              <a
                href={selectedNotice.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
              >
                공식 홈페이지 이동 <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 공지 작성 모달 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                새 공지사항 등록 (관리자 데모 UI)
              </h2>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1">공지 분류</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as NoticeCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="교육학과 공지">교육학과 공지</option>
                  <option value="학교 공지">학교 공지</option>
                  <option value="학사 일정">학사 일정</option>
                  <option value="장학 및 지원">장학 및 지원</option>
                  <option value="교직 관련 안내">교직 관련 안내</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">
                  공지 제목 (자동으로 [예시 데이터] 말머리가 부여됩니다)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 2026학년도 2학기 교육학과 종강총회 안내"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">한 줄 요약</label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="목록에 표시될 짧은 요약 문구"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">본문 내용</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="상세 공지 내용을 입력하세요..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">공식 출처 링크 URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPinned}
                  onChange={(e) => setNewPinned(e.target.checked)}
                  className="rounded text-orange-600"
                />
                <span className="font-semibold">중요 공지로 게시판 상단에 고정하기</span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" /> 공지 등록 (데모)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
