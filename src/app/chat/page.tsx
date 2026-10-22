"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ROLE_LABELS, DemoInfoBanner } from "@/components/common/Cards";
import {
  MessageSquare,
  Send,
  Users,
  UserPlus,
  Search,
  Info,
  PlusCircle,
  Check,
  X,
} from "lucide-react";

export default function ChatPage() {
  const {
    currentUser,
    users,
    conversations,
    messages,
    sendMessage,
    markConversationRead,
    startOrOpenDirectChat,
    createGroupConversation,
  } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(
    conversations[0]?.id || ""
  );
  const [messageInput, setMessageInput] = useState("");
  const [convSearch, setConvSearch] = useState("");
  const [showMemberPanel, setShowMemberPanel] = useState(false);

  // 모달 상태: "direct" (사용자 검색 및 1:1 대화 시작) | "group" (단체 채팅방 개설) | null
  const [modalMode, setModalMode] = useState<"direct" | "group" | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupCategory, setGroupCategory] = useState("수업/스터디 모임");

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  const activeMessages = messages.filter(
    (m) => m.conversationId === activeConversation?.id
  );

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    markConversationRead(convId);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !messageInput.trim()) return;
    sendMessage(activeConversation.id, messageInput);
    setMessageInput("");
  };

  const filteredConversations = conversations.filter((c) => {
    const q = convSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.lastMessageText.toLowerCase().includes(q)
    );
  });

  // 대화 상대 검색용 사용자 목록 (본인 제외)
  const searchableUsers = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.studentIdOrYear.toLowerCase().includes(q) ||
      (u.doubleMajor && u.doubleMajor.toLowerCase().includes(q)) ||
      (u.careerTrack && u.careerTrack.toLowerCase().includes(q))
    );
  });

  const handleStartDirect = (targetUserId: string) => {
    const tag =
      currentUser.role === "professor"
        ? "교수-학생 면담"
        : "학과 구성원 1:1 대화";
    const convId = startOrOpenDirectChat(targetUserId, tag);
    setActiveConvId(convId);
    markConversationRead(convId);
    setModalMode(null);
  };

  const toggleSelectGroupUser = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) return;
    const convId = createGroupConversation(
      groupTitle.trim() || "교육학과 새 단체 채팅방",
      selectedUserIds,
      groupCategory
    );
    setActiveConvId(convId);
    setSelectedUserIds([]);
    setGroupTitle("");
    setModalMode(null);
  };

  const activeMembers =
    activeConversation?.memberIds
      .map((uid) => users.find((u) => u.id === uid))
      .filter(Boolean) || [];

  return (
    <div className="space-y-4">
      {/* 상단 타이틀 및 새 대화 버튼 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-orange-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              동국e음 학과 전용 대화창
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            교수님의 재학생 면담 요청, 선후배 1:1 멘토링 대화, 학술제·스터디 단체 채팅방을 지원합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setUserSearchQuery("");
              setRoleFilter("all");
              setModalMode("direct");
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" /> 사용자 검색 · 1:1 대화 시작
          </button>
          <button
            type="button"
            onClick={() => {
              setUserSearchQuery("");
              setSelectedUserIds([]);
              setGroupTitle("");
              setModalMode("group");
            }}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" /> 단체 채팅방 개설
          </button>
        </div>
      </div>

      <DemoInfoBanner
        title="로컬 데모 메신저 안내 (실제 외부 기기 전송 미구현)"
        description="1차 프로토타입에서는 대화방 개설과 메시지 전송이 현재 브라우저 상태에 즉시 반영됩니다. 실제 다른 사용자의 기기로 푸시 알림이나 실시간 소켓 메시지가 전송되지는 않습니다."
      />

      {/* 메인 메신저 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs min-h-[560px]">
        {/* 좌측: 대화방 목록 */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={convSearch}
                onChange={(e) => setConvSearch(e.target.value)}
                placeholder="대화방 이름 또는 메시지 검색..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[260px] lg:max-h-[520px]">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConversation?.id;
              const myMember = conv.members.find(
                (m) => m.userId === currentUser.id
              );
              const unread = myMember?.unreadCount || 0;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full text-left p-4 transition flex items-start justify-between gap-2 ${
                    isSelected
                      ? "bg-orange-50/90 dark:bg-orange-950/30 border-l-4 border-l-orange-600"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          conv.isGroup
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                        }`}
                      >
                        {conv.isGroup
                          ? `단체 (${conv.memberIds.length}명)`
                          : conv.categoryTag || "1:1 대화"}
                      </span>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {conv.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {conv.lastMessageText}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {conv.lastMessageAt}
                    </span>
                    {unread > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                        안읽음 {unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 우측: 활성 대화 화면 */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/30">
          {activeConversation ? (
            <>
              {/* 대화방 상단 헤더 */}
              <div className="bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {activeConversation.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      참여자 {activeConversation.memberIds.length}명
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    참여 중:{" "}
                    {activeMembers
                      .map((m) => `${m?.name}(${ROLE_LABELS[m!.role]})`)
                      .join(", ")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMemberPanel((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5 text-orange-600" />
                  참여자 정보 {showMemberPanel ? "닫기" : "보기"}
                </button>
              </div>

              {/* 참여자 상세 정보 접이식 패널 */}
              {showMemberPanel && (
                <div className="bg-orange-50/70 dark:bg-slate-900 border-b border-orange-200 dark:border-slate-800 p-3.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orange-600" /> 채팅방 참여 구성원 프로필
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeMembers.map((member) =>
                      member ? (
                        <div
                          key={member.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {member.name}{" "}
                              <span className="text-orange-600 font-semibold">
                                ({ROLE_LABELS[member.role]})
                              </span>
                            </p>
                            <p className="text-slate-500 text-[11px]">
                              {member.studentIdOrYear}
                              {member.doubleMajor ? ` · ${member.doubleMajor}` : ""}
                            </p>
                          </div>
                          {member.careerTrack && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                              {member.careerTrack}
                            </span>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* 메시지 스트림 */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px]">
                {activeMessages.map((msg) => {
                  if (msg.isSystemMessage) {
                    return (
                      <div key={msg.id} className="text-center my-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.senderId === currentUser.id;
                  const sender = users.find((u) => u.id === msg.senderId);

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {!isMe && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 ml-1">
                          {sender?.name || "구성원"} ·{" "}
                          {sender ? ROLE_LABELS[sender.role] : ""} (
                          {sender?.studentIdOrYear})
                        </span>
                      )}
                      <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%]">
                        {isMe && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {msg.createdAt}
                          </span>
                        )}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                            isMe
                              ? "bg-orange-600 text-white rounded-br-xs"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {!isMe && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {msg.createdAt}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 메시지 입력 폼 */}
              <form
                onSubmit={handleSend}
                className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`${currentUser.name}(${ROLE_LABELS[currentUser.role]})님으로 메시지 입력...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shrink-0 transition"
                >
                  <Send className="w-4 h-4" /> 전송
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-sm text-slate-500">
              좌측에서 대화방을 선택하거나 새로운 대화를 시작하세요.
            </div>
          )}
        </div>
      </div>

      {/* 모달 1: 사용자 검색 및 1:1 대화 시작 (교수->재학생 검색 요청, 재학생->졸업생 요청 등) */}
      {modalMode === "direct" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  학과 구성원 검색 및 1:1 대화 요청
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  교수님의 특정 학생 면담 요청, 재학생과 졸업생 간 멘토링 대화를 바로 시작할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="이름, 학번(예: 22학번), 복수전공(예: 심리학), 진로 검색..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm"
              />
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { key: "all", label: "전체 구성원" },
                  { key: "student", label: "재학생" },
                  { key: "alumni", label: "졸업생" },
                  { key: "professor", label: "교수진" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRoleFilter(tab.key)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      roleFilter === tab.key
                        ? "bg-orange-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl">
              {searchableUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {u.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-[10px] font-bold">
                        {ROLE_LABELS[u.role]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {u.studentIdOrYear}
                      {u.doubleMajor ? ` · 복전: ${u.doubleMajor}` : ""}
                      {u.careerTrack ? ` · 진로: ${u.careerTrack}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartDirect(u.id)}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shrink-0"
                  >
                    대화 요청
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 모달 2: 단체 채팅방 개설 */}
      {modalMode === "group" && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  단체 채팅방 개설
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  여러 명의 재학생·졸업생·교수진을 선택해 스터디나 프로젝트 단체방을 만드세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1">단체 채팅방 이름</label>
                <input
                  type="text"
                  required
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="예: 교육공학 팀프로젝트 3조 / 임용 교육학 논술 스터디"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">대화방 성격 태그</label>
                <select
                  value={groupCategory}
                  onChange={(e) => setGroupCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="수업/스터디 모임">수업/스터디 모임</option>
                  <option value="학술제/연구 분과">학술제/연구 분과</option>
                  <option value="진로 멘토링 그룹">진로 멘토링 그룹</option>
                  <option value="학과 자치/소모임">학과 자치/소모임</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">
                  초대할 구성원 선택 ({selectedUserIds.length}명 선택됨)
                </label>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  {users
                    .filter((u) => u.id !== currentUser.id)
                    .map((u) => {
                      const checked = selectedUserIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => toggleSelectGroupUser(u.id)}
                          className={`w-full text-left p-3 flex items-center justify-between transition ${
                            checked
                              ? "bg-orange-50 dark:bg-orange-950/40"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {u.name}
                            </span>{" "}
                            <span className="text-xs text-slate-500">
                              ({ROLE_LABELS[u.role]} · {u.studentIdOrYear})
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                              checked
                                ? "bg-orange-600 border-orange-600 text-white"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={selectedUserIds.length === 0}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold"
                >
                  채팅방 생성하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
