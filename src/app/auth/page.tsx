"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/types";
import { ROLE_LABELS, DemoInfoBanner } from "@/components/common/Cards";
import {
  UserCheck,
  ShieldAlert,
  Clock,
  XCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileWarning,
} from "lucide-react";

type AuthScreenTab =
  | "login"
  | "signup"
  | "pending"
  | "rejected_or_supplement";

export default function AuthPage() {
  const {
    currentRole,
    switchRole,
    submitApprovalRequest,
    approvalRequests,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AuthScreenTab>("signup");

  // 회원가입 데모 폼 상태
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [studentIdOrYear, setStudentIdOrYear] = useState("");
  const [verificationMethod, setVerificationMethod] = useState(
    "학교 웹메일(@dgu.ac.kr) 인증 예정 (데모)"
  );
  const [note, setNote] = useState("");
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim()) return;
    submitApprovalRequest({
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim(),
      requestedRole: selectedRole,
      studentIdOrYear: studentIdOrYear.trim() || "학번/연도 미기재",
      verificationMethod,
      note: note.trim() || "교육학과 구성원 가입 신청 (데모)",
    });
    setApplicantName("");
    setApplicantEmail("");
    setStudentIdOrYear("");
    setNote("");
    setSubmittedNotice(true);
    setActiveTab("pending");
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              회원가입 · 소속 인증 · 관리자 승인 화면
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            폐쇄형 학과 플랫폼인 동국e음의 가입 절차와 승인 대기·보완 요청 UI를 미리 확인하고 테스트할 수 있습니다.
          </p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          관리자 가입 신청 목록 바로가기 ({approvalRequests.length})
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <DemoInfoBanner
        title="보안 및 개인정보 보호 안내 (1차 프로토타입)"
        description="현재 실제 인증 서버가 연결되어 있지 않으므로 실제 비밀번호나 민감한 증명서(재학·졸업증명서 등) 파일을 업로드하거나 저장하지 않습니다. 향후 Firebase Auth / Supabase Auth 도입 시 관리자 승인 회원만 내부 콘텐츠에 접근하도록 제어됩니다."
        variant="amber"
      />

      {/* 단계별 화면 전환 탭 */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        {[
          { key: "login", label: "1. 로그인 화면 (데모)" },
          { key: "signup", label: "2. 회원가입 · 사용자 유형 선택" },
          { key: "pending", label: "3. 관리자 승인 대기 화면" },
          {
            key: "rejected_or_supplement",
            label: "4. 승인 거절 · 보완 요청 안내",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as AuthScreenTab)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === tab.key
                ? "bg-orange-600 text-white"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. 로그인 화면 */}
      {activeTab === "login" && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-black text-2xl flex items-center justify-center mx-auto">
              e
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              동국e음 로그인 (데모 화면)
            </h2>
            <p className="text-xs text-slate-500">
              동국대학교 교육학과 승인 회원 전용 서비스
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 text-xs text-orange-900 dark:text-orange-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-orange-600" /> 실제 비밀번호 입력 불필요 안내
            </p>
            <p>
              1차 버전에서는 실제 개인 비밀번호를 수집하지 않습니다. 아래 버튼으로 역할을 선택하면 즉시 해당 권한의 데모 세션으로 전환됩니다.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              데모 체험 계정 바로 전환하기 (현재: {ROLE_LABELS[currentRole]})
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["student", "alumni", "professor", "admin"] as UserRole[]).map(
                (r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => switchRole(r)}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      currentRole === r
                        ? "bg-orange-600 border-orange-600 text-white"
                        : "border-slate-200 dark:border-slate-700 hover:border-orange-400"
                    }`}
                  >
                    {ROLE_LABELS[r]} 계정으로 체험
                  </button>
                )
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              아직 회원이 아니신가요? 회원가입 및 소속 인증 신청 →
            </button>
          </div>
        </div>
      )}

      {/* 2. 회원가입 · 사용자 유형 선택 · 소속 인증 안내 */}
      {activeTab === "signup" && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              동국e음 회원가입 신청 및 소속 인증 안내
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              가입 신청서를 제출하면 [관리자 센터]의 가입 신청 목록에 실시간(로컬 상태)으로 등록되어 승인/보완 절차를 시연할 수 있습니다.
            </p>
          </div>

          {/* Step 1: 사용자 유형 선택 */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold">
              Step 1. 사용자 유형 선택
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  role: "student" as UserRole,
                  title: "재학생 (본전공·복수전공)",
                  desc: "공지 확인, 졸업요건 자가점검, 공유방·멘토링 참여",
                },
                {
                  role: "alumni" as UserRole,
                  title: "졸업생 (동문 멘토)",
                  desc: "진로 프로필 등록, 후배 멘토링 및 직무 경험 공유",
                },
                {
                  role: "professor" as UserRole,
                  title: "교수진 · 강사",
                  desc: "학생 검색 및 면담 요청, 연구·진로 공유방 지도",
                },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    selectedRole === item.role
                      ? "bg-orange-50 dark:bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-orange-300"
                  }`}
                >
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: 소속 인증 안내 (증명서 파일 미업로드 원칙 준수) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileWarning className="w-4 h-4 text-orange-600" /> Step 2. 소속 인증 방식 안내 (민감 증명서 파일 업로드 미구현)
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              실제 서비스 운영 단계에서는 학교 공식 웹메일(<code>@dgu.ac.kr</code>) 인증 또는 학과 사무실 명부 대조를 통해 소속을 확인합니다. <strong>현재 프로토타입에서는 개인정보 보호를 위해 재학증명서·졸업증명서 등 민감한 파일을 업로드하거나 저장하지 않습니다.</strong>
            </p>
          </div>

          {/* Step 3: 신청 정보 입력 */}
          <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">이름 (가상 이름 입력 권장)</label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="예: 김교육"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">이메일 (예시 이메일)</label>
                <input
                  type="email"
                  required
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="예: student@sample.dgu.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">학번 / 졸업연도 / 직함</label>
                <input
                  type="text"
                  required
                  value={studentIdOrYear}
                  onChange={(e) => setStudentIdOrYear(e.target.value)}
                  placeholder="예: 24학번 재학 / 19학번 졸업"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">희망 소속 확인 방법</label>
                <select
                  value={verificationMethod}
                  onChange={(e) => setVerificationMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="학교 웹메일(@dgu.ac.kr) 인증 예정 (데모)">
                    학교 웹메일(@dgu.ac.kr) 인증 예정 (데모)
                  </option>
                  <option value="학과 사무실 재학/졸업 명부 대조 요청 (데모)">
                    학과 사무실 재학/졸업 명부 대조 요청 (데모)
                  </option>
                  <option value="복수전공 이수 승인 학번 확인 요청 (데모)">
                    복수전공 이수 승인 학번 확인 요청 (데모)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">가입 인사 및 소속 확인 메모</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="학과 관리자가 소속을 확인할 수 있도록 간단한 소개를 남겨주세요."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                가입 승인 신청하기 (데모 등록)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. 관리자 승인 대기 화면 */}
      {activeTab === "pending" && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs">
          {submittedNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 가입 신청이 접수되어 관리자 신청 목록에 추가되었습니다!
            </div>
          )}

          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            관리자 소속 승인 대기 중입니다
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            <strong>동국e음</strong>은 동국대학교 교육학과 구성원(재학생·복수전공생·졸업생·교수진)의 안전한 소통을 위해 학과 관리자의 소속 확인 승인 후 모든 게시판과 대화창이 열립니다.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 text-left text-xs space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              승인 처리 절차 안내
            </p>
            <p className="text-slate-500">
              1. 가입 신청 및 학번/이메일 제출 → 2. 교육학과 관리자 확인 → 3. 승인 완료 후 커뮤니티 전체 기능 활성화
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-2">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
            >
              관리자 화면에서 방금 신청한 내역 승인해보기 →
            </Link>
          </div>
        </div>
      )}

      {/* 4. 승인 거절 또는 보완 요청 안내 화면 */}
      {activeTab === "rejected_or_supplement" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 보완 요청 화면 예시 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-300 dark:border-amber-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-lg font-black">소속 정보 보완 요청 안내 화면</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              제출하신 가입 신청서에서 학번 또는 교육학과 소속 확인 정보가 부족하여 관리자가 보완을 요청한 상태입니다.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs space-y-1">
              <p className="font-bold text-amber-900 dark:text-amber-200">
                관리자 전달 메모:
              </p>
              <p className="text-amber-800 dark:text-amber-300">
                &ldquo;학번(입학연도)과 교육학과 본전공/복수전공 여부가 누락되어 있습니다. 정보를 보완하여 다시 제출해 주세요.&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("signup")}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
            >
              가입 신청 정보 수정 및 재제출하기
            </button>
          </div>

          {/* 승인 거절 화면 예시 */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-rose-600">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-black">가입 승인 거절 안내 화면</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              동국대학교 교육학과 구성원 자격이 확인되지 않거나 외부 홍보 목적 계정으로 판단되어 가입 승인이 거절되었습니다.
            </p>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs space-y-1">
              <p className="font-bold text-rose-900 dark:text-rose-200">
                거절 사유:
              </p>
              <p className="text-rose-800 dark:text-rose-300">
                &ldquo;동국대학교 교육학과 구성원(재학생·졸업생·교수진)만 가입할 수 있는 폐쇄형 플랫폼입니다.&rdquo;
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              ※ 착오로 거절된 경우 교육학과 사무실로 문의해 주시기 바랍니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
