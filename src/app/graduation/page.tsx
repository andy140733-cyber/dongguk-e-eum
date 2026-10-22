"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { GraduationRequirement, RequirementCategory } from "@/types";
import {
  RequirementProgressCard,
  DemoInfoBanner,
} from "@/components/common/Cards";
import {
  CheckSquare,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  Circle,
  Settings,
  X,
} from "lucide-react";

export default function GraduationPage() {
  const {
    graduationRequirements,
    studentProgress,
    updateStudentCredit,
    updateStudentProfileMeta,
    addVolunteeringRecord,
    removeVolunteeringRecord,
    toggleChecklistItem,
    addChecklistItem,
  } = useApp();

  // 학점/목표 수정 모달 상태
  const [editingReq, setEditingReq] = useState<GraduationRequirement | null>(
    null
  );
  const [editCompletedVal, setEditCompletedVal] = useState<number>(0);
  const [editCustomTarget, setEditCustomTarget] = useState<string>("");
  const [editBooleanVal, setEditBooleanVal] = useState<boolean>(false);

  // 학생 기본 소속/학번 설정 모달
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaYear, setMetaYear] = useState(studentProgress.admissionYear);
  const [metaMajorType, setMetaMajorType] = useState(studentProgress.majorType);
  const [metaDoubleMajor, setMetaDoubleMajor] = useState(
    studentProgress.doubleMajorName
  );
  const [metaTeacher, setMetaTeacher] = useState(studentProgress.isTeacherTrack);

  // 교육봉사 추가 폼 상태
  const [volInst, setVolInst] = useState("");
  const [volDate, setVolDate] = useState("");
  const [volHours, setVolHours] = useState<number>(4);
  const [volNote, setVolNote] = useState("");

  // 체크리스트 추가 폼 상태
  const [newChkLabel, setNewChkLabel] = useState("");
  const [newChkCat, setNewChkCat] =
    useState<RequirementCategory>("졸업 이수 학점");
  const [newChkMemo, setNewChkMemo] = useState("");

  const openEditModal = (req: GraduationRequirement) => {
    const currentRecord = studentProgress.credits[req.category];
    setEditingReq(req);
    setEditCompletedVal(currentRecord?.completedValue ?? 0);
    setEditCustomTarget(
      currentRecord?.userCustomTarget !== null &&
        currentRecord?.userCustomTarget !== undefined
        ? String(currentRecord.userCustomTarget)
        : ""
    );
    setEditBooleanVal(Boolean(currentRecord?.isCompletedBoolean));
  };

  const handleSaveCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq) return;
    const parsedTarget =
      editCustomTarget.trim() === "" ? null : Number(editCustomTarget);
    updateStudentCredit(
      editingReq.category,
      Number(editCompletedVal),
      parsedTarget && parsedTarget > 0 ? parsedTarget : null,
      editBooleanVal
    );
    setEditingReq(null);
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfileMeta(
      metaYear,
      metaMajorType,
      metaDoubleMajor,
      metaTeacher
    );
    setIsMetaModalOpen(false);
  };

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volInst.trim() || !volDate.trim() || volHours <= 0) return;
    addVolunteeringRecord(
      volInst.trim(),
      volDate.trim(),
      Number(volHours),
      volNote.trim() || "자가점검 봉사 기록"
    );
    setVolInst("");
    setVolDate("");
    setVolHours(4);
    setVolNote("");
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChkLabel.trim()) return;
    addChecklistItem(newChkLabel.trim(), newChkCat, newChkMemo.trim());
    setNewChkLabel("");
    setNewChkMemo("");
  };

  const completedCheckCount = studentProgress.checklist.filter(
    (c) => c.completed
  ).length;

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              졸업요건 자가점검 대시보드
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            입학 연도와 다전공·교직 여부에 따른 나의 학점, 교육봉사 시간, 필수 체크리스트를 직접 기록하고 점검하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMetaYear(studentProgress.admissionYear);
            setMetaMajorType(studentProgress.majorType);
            setMetaDoubleMajor(studentProgress.doubleMajorName);
            setMetaTeacher(studentProgress.isTeacherTrack);
            setIsMetaModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Settings className="w-4 h-4" /> 내 입학연도·이수트랙 설정
        </button>
      </div>

      {/* 필수 주의 배너 (기능 D 핵심 요구사항 준수) */}
      <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/30 p-4 text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-1.5">
        <div className="flex items-center gap-2 font-extrabold text-amber-900 dark:text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>[중요 안내] 공식 학사 시스템 연동 결과가 아닌 개인 ‘자가점검’ 화면입니다</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-xs opacity-95 pl-1">
          <li>
            동국대학교의 실제 졸업요건 수치나 교육봉사 기준 시간은 <strong>입학 연도(학번), 단일/복수전공 여부, 교직 이수 여부</strong>에 따라 달라지므로 시스템이 임의의 숫자를 강제하지 않습니다.
          </li>
          <li>
            공식 기준이 미설정된 항목은 <strong>허위 진행률(%)을 계산하지 않으며 ‘기준 미설정’으로 표시</strong>합니다. 본인의 학번별 대학 요람을 확인한 뒤 각 카드의 [수치·목표 수정]에서 직접 목표 기준치를 입력하면 자가점검 달성률을 볼 수 있습니다.
          </li>
        </ul>
      </div>

      {/* 현재 학생의 적용 요건 프로필 요약 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-3 shadow-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <p className="text-[11px] text-slate-500">적용 입학 연도(학번)</p>
          <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
            {studentProgress.admissionYear}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <p className="text-[11px] text-slate-500">전공 이수 형태</p>
          <p className="font-extrabold text-sm text-orange-600 mt-0.5">
            {studentProgress.majorType}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <p className="text-[11px] text-slate-500">복수전공 학과</p>
          <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
            {studentProgress.doubleMajorName || "해당 없음"}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <p className="text-[11px] text-slate-500">교직 과정 여부</p>
          <p className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">
            {studentProgress.isTeacherTrack ? "교직 이수 병행" : "일반 학사 트랙"}
          </p>
        </div>
      </div>

      {/* 8개 졸업요건 항목 대시보드 그리드 */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          항목별 이수 학점 및 요건 자가점검 (총 8개 영역)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {graduationRequirements.map((req) => {
            const creditInfo = studentProgress.credits[req.category];
            return (
              <RequirementProgressCard
                key={req.id}
                requirement={req}
                completedValue={creditInfo?.completedValue ?? 0}
                userCustomTarget={creditInfo?.userCustomTarget ?? null}
                isCompletedBoolean={creditInfo?.isCompletedBoolean}
                onEdit={() => openEditModal(req)}
              />
            );
          })}
        </div>
      </section>

      {/* 중단 2단: 교육봉사 시간 기록장 & 완료/미완료 체크리스트 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 교육봉사 시간 기록 */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                교육봉사 시간 자가 기록장
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs font-extrabold">
              누적 기록:{" "}
              {studentProgress.credits["교육봉사 시간"]?.completedValue ?? 0}시간
            </span>
          </div>

          <form
            onSubmit={handleAddVolunteer}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2.5 text-xs"
          >
            <p className="font-bold text-slate-700 dark:text-slate-200">
              + 새로운 교육봉사 활동 내역 추가
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={volInst}
                onChange={(e) => setVolInst(e.target.value)}
                placeholder="봉사 기관명 (예: 동국중학교 방과후학교)"
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                required
                value={volDate}
                onChange={(e) => setVolDate(e.target.value)}
                placeholder="활동 일자/기간 (예: 2026-10-15)"
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={200}
                required
                value={volHours}
                onChange={(e) => setVolHours(Number(e.target.value))}
                placeholder="인정 시간"
                className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                value={volNote}
                onChange={(e) => setVolNote(e.target.value)}
                placeholder="활동 내용 메모 (예: 기초학력 멘토링)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shrink-0 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 기록
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {studentProgress.volunteeringRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rec.institutionName}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold">
                      +{rec.hours}시간
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    {rec.activityDate} · {rec.note}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeVolunteeringRecord(rec.id)}
                  title="기록 삭제"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 완료·미완료 체크리스트 */}
        <section className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                졸업 준비 완료·미완료 체크리스트
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {completedCheckCount} / {studentProgress.checklist.length} 완료
            </span>
          </div>

          <form
            onSubmit={handleAddChecklist}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2 text-xs"
          >
            <p className="font-bold text-slate-700 dark:text-slate-200">
              + 나만의 점검 할 일 추가
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newChkCat}
                onChange={(e) =>
                  setNewChkCat(e.target.value as RequirementCategory)
                }
                className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {graduationRequirements.map((r) => (
                  <option key={r.id} value={r.category}>
                    {r.category}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                value={newChkLabel}
                onChange={(e) => setNewChkLabel(e.target.value)}
                placeholder="점검할 항목 (예: 복수전공 필수과목 시간표 확인)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newChkMemo}
                onChange={(e) => setNewChkMemo(e.target.value)}
                placeholder="보조 메모 (선택)"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold shrink-0"
              >
                추가
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {studentProgress.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 text-xs ${
                  item.completed
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300"
                }`}
              >
                <button type="button" className="mt-0.5 text-orange-600 shrink-0">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      {item.category}
                    </span>
                    <p
                      className={`font-bold ${
                        item.completed
                          ? "line-through text-slate-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                  {item.memo && (
                    <p className="text-slate-500 mt-0.5">{item.memo}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 관련 공식 안내 링크 영역 */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          동국대학교 학사·교직 공식 안내 바로가기
        </h2>
        <p className="text-xs text-slate-500">
          본인의 입학 연도(학번)에 해당하는 정확한 졸업 이수 학점과 교직·다전공 기준은 반드시 아래 공식 페이지에서 확인하세요.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <a
            href="https://www.dongguk.edu"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200"
          >
            <span>동국대학교 공식 홈페이지 (학사안내)</span>
            <ExternalLink className="w-4 h-4 text-orange-600" />
          </a>
          <a
            href="https://www.dongguk.edu"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200"
          >
            <span>사범대학·교육학과 교육과정 요람 확인</span>
            <ExternalLink className="w-4 h-4 text-orange-600" />
          </a>
          <a
            href="https://www.dongguk.edu"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-400 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200"
          >
            <span>교직부 (교육봉사·교육실습·무시험검정 안내)</span>
            <ExternalLink className="w-4 h-4 text-orange-600" />
          </a>
        </div>
      </section>

      {/* 모달 1: 학점/목표 수정 */}
      {editingReq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {editingReq.category} 자가점검 기록 수정
              </h2>
              <button
                type="button"
                onClick={() => setEditingReq(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCredit} className="space-y-3 text-xs sm:text-sm">
              {editingReq.unit === "여부" ? (
                <label className="flex items-center gap-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editBooleanVal}
                    onChange={(e) => setEditBooleanVal(e.target.checked)}
                  />
                  <span className="font-bold">
                    해당 요건({editingReq.title})을 이수/충족 완료했습니다
                  </span>
                </label>
              ) : (
                <>
                  <div>
                    <label className="block font-bold mb-1">
                      내가 현재까지 이수한 {editingReq.unit}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      required
                      value={editCompletedVal}
                      onChange={(e) => setEditCompletedVal(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">
                      내 학번 요람에서 확인한 목표 기준 {editingReq.unit} (선택 입력)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={editCustomTarget}
                      onChange={(e) => setEditCustomTarget(e.target.value)}
                      placeholder="비워두면 '기준 미설정' 상태 유지"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      ※ 비워두면 임의의 진행률(%)을 계산하지 않고 ‘기준 미설정’으로 안전하게 표시합니다.
                    </p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 모달 2: 입학 연도 및 전공 트랙 설정 */}
      {isMetaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                내 입학 연도·전공 이수 형태 설정
              </h2>
              <button
                type="button"
                onClick={() => setIsMetaModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1">입학 연도 (학번)</label>
                <input
                  type="text"
                  value={metaYear}
                  onChange={(e) => setMetaYear(e.target.value)}
                  placeholder="예: 2022학년도 입학 (22학번)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">전공 이수 구분</label>
                <select
                  value={metaMajorType}
                  onChange={(e) =>
                    setMetaMajorType(
                      e.target.value as typeof studentProgress.majorType
                    )
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="단일전공(심화)">단일전공(심화)</option>
                  <option value="복수전공 이수">복수전공 이수</option>
                  <option value="교직 이수 병행">교직 이수 병행</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">복수전공 학과명</label>
                <input
                  type="text"
                  value={metaDoubleMajor}
                  onChange={(e) => setMetaDoubleMajor(e.target.value)}
                  placeholder="예: 심리학과 / 경영학과 / 없음"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metaTeacher}
                  onChange={(e) => setMetaTeacher(e.target.checked)}
                />
                <span className="font-bold">교직 과정 이수 대상자입니다</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMetaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  적용하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
