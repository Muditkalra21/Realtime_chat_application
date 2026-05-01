import Sidebar from "../components/chat/Sidebar.jsx";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import useChatStore from "../store/useChatStore.js";

const ChatPage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-200">
      {/*
       * On mobile (<md): show Sidebar OR ChatWindow based on whether a user is selected.
       * On desktop (md+): show both side-by-side.
       */}
      <div
        className={`
          ${selectedUser ? "hidden" : "flex"} md:flex
          w-full md:w-80 flex-shrink-0 flex-col
        `}
      >
        <Sidebar />
      </div>

      <main
        className={`
          ${selectedUser ? "flex" : "hidden"} md:flex
          flex-1 flex-col overflow-hidden
        `}
      >
        <ChatWindow />
      </main>
    </div>
  );
};

export default ChatPage;
