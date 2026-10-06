/**
 * Chatbot about Bharat - Client Application
 * Features:
 * - ChatGPT-style conversation sidebar
 * - Multi-session chat management with localStorage persistence
 * - Context retention for existing sessions (sent to backend)
 * - Fresh context (pure RAG) for new sessions
 * - Markdown rendering & copy-to-clipboard
 */

(function () {
  // DOM Elements
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const newChatBtn = document.getElementById('new-chat-btn');
  const headerNewChatBtn = document.getElementById('header-new-chat-btn');
  const historyList = document.getElementById('history-list');
  const clearAllBtn = document.getElementById('clear-all-btn');
  
  const chatFeed = document.getElementById('chat-feed');
  const emptyState = document.getElementById('empty-state');
  const messagesContainer = document.getElementById('messages-container');
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const suggestionCards = document.querySelectorAll('.suggestion-card');

  // Storage Keys
  const STORAGE_KEY = 'bharat_chat_sessions_v1';
  const ACTIVE_CHAT_KEY = 'bharat_active_chat_id_v1';

  // State
  let chats = [];
  let activeChatId = null;
  let isGenerating = false;

  // Initialize
  function init() {
    loadSessions();
    setupEventListeners();
    renderSidebar();
    renderCurrentChat();
  }

  // Load chats from localStorage
  function loadSessions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      chats = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse chats from localStorage:', e);
      chats = [];
    }

    const lastActiveId = localStorage.getItem(ACTIVE_CHAT_KEY);
    if (lastActiveId && chats.some(c => c.id === lastActiveId)) {
      activeChatId = lastActiveId;
    } else if (chats.length > 0) {
      activeChatId = chats[0].id;
    } else {
      createNewChat(false);
    }
  }

  // Save chats to localStorage
  function saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      if (activeChatId) {
        localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // Get active chat object
  function getActiveChat() {
    return chats.find(c => c.id === activeChatId);
  }

  // Create a new chat session
  function createNewChat(shouldRender = true) {
    const newChat = {
      id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: 'New Conversation',
      createdAt: Date.now(),
      messages: []
    };

    chats.unshift(newChat);
    activeChatId = newChat.id;
    saveSessions();

    if (shouldRender) {
      renderSidebar();
      renderCurrentChat();
      userInput.focus();
    }
    closeSidebarOnMobile();
  }

  // Switch to a previous chat
  function switchChat(chatId) {
    if (chatId === activeChatId || isGenerating) return;
    activeChatId = chatId;
    saveSessions();
    renderSidebar();
    renderCurrentChat();
    closeSidebarOnMobile();
  }

  // Delete an individual chat
  function deleteChat(chatId, e) {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    chats = chats.filter(c => c.id !== chatId);
    if (activeChatId === chatId) {
      if (chats.length > 0) {
        activeChatId = chats[0].id;
      } else {
        createNewChat(false);
      }
    }
    saveSessions();
    renderSidebar();
    renderCurrentChat();
  }

  // Clear all chats
  function clearAllChats() {
    if (!confirm('Are you sure you want to clear all conversation history?')) return;
    chats = [];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    createNewChat(true);
  }

  // Render Sidebar chat list
  function renderSidebar() {
    historyList.innerHTML = '';

    if (chats.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'history-item';
      emptyItem.style.color = 'var(--text-muted)';
      emptyItem.style.cursor = 'default';
      emptyItem.textContent = 'No previous conversations';
      historyList.appendChild(emptyItem);
      return;
    }

    chats.forEach(chat => {
      const li = document.createElement('li');
      li.className = `history-item ${chat.id === activeChatId ? 'active' : ''}`;
      li.onclick = () => switchChat(chat.id);

      const leftDiv = document.createElement('div');
      leftDiv.className = 'history-item-left';

      // Chat bubble icon
      leftDiv.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

      const titleSpan = document.createElement('span');
      titleSpan.className = 'history-title';
      titleSpan.textContent = chat.title || 'New Conversation';
      titleSpan.title = chat.title || 'New Conversation';
      leftDiv.appendChild(titleSpan);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-chat-btn';
      deleteBtn.title = 'Delete conversation';
      deleteBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      deleteBtn.onclick = (e) => deleteChat(chat.id, e);

      li.appendChild(leftDiv);
      li.appendChild(deleteBtn);
      historyList.appendChild(li);
    });
  }

  // Render Current Chat messages
  function renderCurrentChat() {
    const currentChat = getActiveChat();
    messagesContainer.innerHTML = '';

    if (!currentChat || currentChat.messages.length === 0) {
      emptyState.style.display = 'flex';
      messagesContainer.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      messagesContainer.style.display = 'flex';

      currentChat.messages.forEach(msg => {
        appendMessageElement(msg.role, msg.content, false);
      });

      scrollToBottom();
    }
  }

  // Append a message bubble to DOM
  function appendMessageElement(role, content, shouldScroll = true) {
    emptyState.style.display = 'none';
    messagesContainer.style.display = 'flex';

    const row = document.createElement('div');
    row.className = `message-row ${role === 'user' ? 'user-row' : 'bot-row'}`;

    if (role === 'assistant') {
      const avatar = document.createElement('div');
      avatar.className = 'avatar bot-avatar';
      avatar.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4"></path>
          <path d="M8 2h8"></path>
          <rect x="4" y="6" width="16" height="12" rx="3"></rect>
          <circle cx="9" cy="11" r="1.5" fill="currentColor"></circle>
          <circle cx="15" cy="11" r="1.5" fill="currentColor"></circle>
          <path d="M9 15h6"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
        </svg>
      `;
      row.appendChild(avatar);
    }

    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.style.maxWidth = '85%';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (role === 'assistant') {
      if (typeof marked !== 'undefined') {
        bubble.innerHTML = marked.parse(content || '');
      } else {
        bubble.textContent = content || '';
      }

      // Actions row (copy button)
      const actions = document.createElement('div');
      actions.className = 'message-actions';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `;
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(content);
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span style="color: var(--accent-emerald);">Copied!</span>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          `;
        }, 2000);
      };

      actions.appendChild(copyBtn);
      bubbleWrapper.appendChild(bubble);
      bubbleWrapper.appendChild(actions);
    } else {
      bubble.textContent = content;
      bubbleWrapper.appendChild(bubble);
    }

    row.appendChild(bubbleWrapper);

    if (role === 'user') {
      const avatar = document.createElement('div');
      avatar.className = 'avatar user-avatar';
      avatar.textContent = 'U';
      row.appendChild(avatar);
    }

    messagesContainer.appendChild(row);

    if (shouldScroll) {
      scrollToBottom();
    }

    return row;
  }

  // Show typing loader
  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'message-row bot-row typing-indicator-row';
    row.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'avatar bot-avatar';
    avatar.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4"></path>
        <path d="M8 2h8"></path>
        <rect x="4" y="6" width="16" height="12" rx="3"></rect>
        <circle cx="9" cy="11" r="1.5" fill="currentColor"></circle>
        <circle cx="15" cy="11" r="1.5" fill="currentColor"></circle>
        <path d="M9 15h6"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
      </svg>
    `;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing-bubble';
    bubble.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesContainer.appendChild(row);
    scrollToBottom();
  }

  // Remove typing loader
  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // Send message
  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    const currentChat = getActiveChat();
    if (!currentChat) return;

    // If first message in this chat, set the chat title
    if (currentChat.messages.length === 0) {
      currentChat.title = trimmed.length > 38 ? trimmed.substring(0, 38) + '...' : trimmed;
    }

    // Append user message to state & UI
    currentChat.messages.push({ role: 'user', content: trimmed });
    appendMessageElement('user', trimmed, true);

    // Reset input
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Prepare previous history for the backend (all messages prior to the current user message)
    // This gives the model the full context of this conversation!
    const historyPayload = currentChat.messages.slice(0, -1);

    isGenerating = true;
    showTypingIndicator();
    saveSessions();
    renderSidebar();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.response || "I could not generate a response.";

      removeTypingIndicator();
      currentChat.messages.push({ role: 'assistant', content: botReply });
      appendMessageElement('assistant', botReply, true);

      saveSessions();
    } catch (err) {
      console.error('Chat request failed:', err);
      removeTypingIndicator();
      const errorMsg = "⚠️ Unable to get a response from the server. Please verify the backend is running.";
      currentChat.messages.push({ role: 'assistant', content: errorMsg });
      appendMessageElement('assistant', errorMsg, true);
      saveSessions();
    } finally {
      isGenerating = false;
      userInput.focus();
    }
  }

  // Auto-scroll to bottom of chat
  function scrollToBottom() {
    chatFeed.scrollTo({
      top: chatFeed.scrollHeight,
      behavior: 'smooth'
    });
  }

  // Event Listeners
  function setupEventListeners() {
    // Form submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(userInput.value);
    });

    // Textarea input & keyboard shortcuts
    userInput.addEventListener('input', () => {
      userInput.style.height = 'auto';
      userInput.style.height = Math.min(userInput.scrollHeight, 180) + 'px';
      sendBtn.disabled = !userInput.value.trim() || isGenerating;
    });

    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(userInput.value);
      }
    });

    // Buttons
    newChatBtn.addEventListener('click', () => createNewChat(true));
    headerNewChatBtn.addEventListener('click', () => createNewChat(true));
    clearAllBtn.addEventListener('click', clearAllChats);

    // Sidebar toggling for mobile
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', closeSidebarOnMobile);

    // Suggestion cards
    suggestionCards.forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt');
        if (prompt) {
          userInput.value = prompt;
          userInput.style.height = 'auto';
          sendMessage(prompt);
        }
      });
    });
  }

  function closeSidebarOnMobile() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  }

  // Start app
  init();
})();
