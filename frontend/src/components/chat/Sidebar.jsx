import { useEffect, useState } from "react";
import { Search, LogOut, Settings, MessageSquare } from "lucide-react";
import useChatStore from "../../store/useChatStore.js";
import useAuthStore from "../../store/useAuthStore.js";
import Avatar from "../ui/Avatar.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import ProfileModal from "./ProfileModal.jsx";
import { formatLastSeen } from "../../utils/formatLastSeen.js";

const Sidebar = () => {
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const { users, fetchUsers, selectedUser, setSelectedUser, isUserOnline, isLoadingUsers, lastSeenMap } = useChatStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Sidebar fills its parent container — width is controlled by ChatPage */}
      <aside className="flex flex-col bg-white dark:bg-dark-100 border-r border-gray-100 dark:border-dark-400 h-full w-full">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-dark-400">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                ChatterBox
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-400 transition-all"
                title="Profile settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Current user info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-200 rounded-xl">
            <Avatar src={user?.avatar} username={user?.username} size={38} isOnline={true} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-emerald-500 font-medium">Active now</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 text-sm py-2"
            />
          </div>
        </div>

        {/* Section label */}
        <div className="px-4 pb-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Direct Messages
          </p>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto pb-4">
          {isLoadingUsers ? (
            <div className="flex justify-center pt-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-8 px-4">
              {search ? "No contacts match your search" : "No users found"}
            </div>
          ) : (
            filtered.map((contact) => {
              const isOnline = isUserOnline(contact.id);
              const isActive = selectedUser?.id === contact.id;

              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedUser(contact)}
                  className={`contact-item ${isActive ? "contact-item-active" : ""}`}
                >
                  <Avatar
                    src={contact.avatar}
                    username={contact.username}
                    size={44}
                    isOnline={isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {contact.username}
                      </p>
                      {isOnline && (
                        <span className="text-xs text-emerald-500 font-medium flex-shrink-0">
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {isOnline ? contact.email : formatLastSeen(lastSeenMap[contact.id])}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Profile Modal */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Sidebar;
