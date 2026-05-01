import { useState, useRef } from "react";
import { X, Camera, User } from "lucide-react";
import useAuthStore from "../../store/useAuthStore.js";
import Avatar from "../ui/Avatar.jsx";
import api from "../../services/api.js";
import toast from "react-hot-toast";

const ProfileModal = ({ onClose }) => {
  const { user, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update avatar in backend
      await api.put("/auth/update-avatar", { avatar: res.data.url });
      updateUser({ avatar: res.data.url });
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-400">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User size={20} /> Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-400 text-gray-500 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          {/* Avatar with upload button */}
          <div className="relative">
            <Avatar src={user?.avatar} username={user?.username} size={88} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-all shadow-md"
              title="Change avatar"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>
          </div>

          {/* User info */}
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>

          <div className="w-full bg-gray-50 dark:bg-dark-200 rounded-xl px-4 py-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-500 dark:text-gray-400">Member since</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="btn-primary w-full">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
