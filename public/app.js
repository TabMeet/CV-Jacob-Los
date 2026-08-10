(() => {
    'use strict';

    const STORAGE_COMPANION = 'companion.v1';
    const STORAGE_HISTORY = 'companion.history.v1';

    const AVATARS = ['🤖', '👤', '🦊', '🐱', '🐺', '🐧', '🐉', '🌸', '🌙', '⭐', '🔥', '💫', '🎭', '👾'];
    const COLORS = ['#7c5cff', '#ff5c8a', '#ff9d4d', '#f5d547', '#4dd9c0', '#4d9dff', '#a45cff', '#5cff9d'];

    const el = (id) => document.getElementById(id);

    const setupScreen = el('setup-screen');
    const chatScreen = el('chat-screen');
    const setupTitle = el('setup-title');
    const inputName = el('input-name');
    const inputPersonality = el('input-personality');
    const inputAvatarCustom = el('input-avatar-custom');
    const avatarGrid = el('avatar-grid');
    const colorGrid = el('color-grid');
    const btnSave = el('btn-save-companion');
    const btnCancelSetup = el('btn-cancel-setup');

    const headerAvatar = el('header-avatar');
    const headerName = el('header-name');
    const messageList = el('message-list');
    const chatForm = el('chat-form');
    const chatInput = el('chat-input');
    const btnSend = el('btn-send');
    const btnClearChat = el('btn-clear-chat');
    const btnEditCompanion = el('btn-edit-companion');

    let companion = null;
    let history = [];
    let selectedAvatar = AVATARS[0];
    let selectedColor = COLORS[0];
    let isEditingExisting = false;

    function loadCompanion() {
        try {
            const raw = localStorage.getItem(STORAGE_COMPANION);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function loadHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_HISTORY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveCompanion(c) {
        localStorage.setItem(STORAGE_COMPANION, JSON.stringify(c));
    }

    function saveHistory() {
        localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
    }

    function applyAccent(color) {
        document.documentElement.style.setProperty('--accent', color);
    }

    function buildAvatarGrid() {
        avatarGrid.innerHTML = '';
        AVATARS.forEach((emoji) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'avatar-option';
            btn.textContent = emoji;
            btn.addEventListener('click', () => {
                selectedAvatar = emoji;
                inputAvatarCustom.value = '';
                refreshAvatarSelection();
            });
            avatarGrid.appendChild(btn);
        });
    }

    function refreshAvatarSelection() {
        [...avatarGrid.children].forEach((btn) => {
            btn.classList.toggle('selected', btn.textContent === selectedAvatar);
        });
    }

    function buildColorGrid() {
        colorGrid.innerHTML = '';
        COLORS.forEach((color) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'color-option';
            btn.style.background = color;
            btn.dataset.color = color;
            btn.addEventListener('click', () => {
                selectedColor = color;
                applyAccent(color);
                refreshColorSelection();
            });
            colorGrid.appendChild(btn);
        });
    }

    function refreshColorSelection() {
        [...colorGrid.children].forEach((btn) => {
            btn.classList.toggle('selected', btn.dataset.color === selectedColor);
        });
    }

    inputAvatarCustom.addEventListener('input', () => {
        const val = inputAvatarCustom.value.trim();
        if (val) {
            selectedAvatar = val;
            refreshAvatarSelection();
        }
    });

    function showSetupScreen(editing) {
        isEditingExisting = editing;
        setupTitle.textContent = editing ? 'Edit your companion' : 'Create your companion';
        btnCancelSetup.classList.toggle('hidden', !editing);
        btnSave.textContent = editing ? 'Save changes' : 'Save & start chatting';

        if (editing && companion) {
            inputName.value = companion.name;
            inputPersonality.value = companion.personality;
            selectedAvatar = companion.avatar;
            selectedColor = companion.color;
        } else {
            inputName.value = '';
            inputPersonality.value = '';
            selectedAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
            selectedColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
        applyAccent(selectedColor);
        refreshAvatarSelection();
        refreshColorSelection();

        setupScreen.classList.remove('hidden');
        chatScreen.classList.add('hidden');
        inputName.focus();
    }

    function showChatScreen() {
        setupScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        applyAccent(companion.color);
        headerAvatar.textContent = companion.avatar;
        headerName.textContent = companion.name;
        renderHistory();
        chatInput.focus();
    }

    btnSave.addEventListener('click', () => {
        const name = inputName.value.trim();
        if (!name) {
            inputName.focus();
            return;
        }
        const personality = inputPersonality.value.trim() || 'Warm, curious, and easygoing.';

        companion = {
            name,
            personality,
            avatar: selectedAvatar,
            color: selectedColor,
        };
        saveCompanion(companion);
        showChatScreen();
    });

    btnCancelSetup.addEventListener('click', () => {
        if (companion) showChatScreen();
    });

    btnEditCompanion.addEventListener('click', () => showSetupScreen(true));

    btnClearChat.addEventListener('click', () => {
        if (!confirm('Clear this conversation? This cannot be undone.')) return;
        history = [];
        saveHistory();
        renderHistory();
    });

    function renderHistory() {
        messageList.innerHTML = '';
        history.forEach((msg) => appendMessageRow(msg.role, msg.content));
        scrollToBottom();
    }

    function appendMessageRow(role, content, opts = {}) {
        const row = document.createElement('div');
        row.className = `msg-row ${role === 'user' ? 'user' : 'companion'}${opts.error ? ' error' : ''}`;

        const avatar = document.createElement('div');
        avatar.className = 'msg-avatar';
        avatar.textContent = role === 'user' ? '🙂' : companion.avatar;
        if (role !== 'user') avatar.style.background = companion.color;
        else avatar.style.background = '#3a3d42';

        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        if (opts.typing) {
            bubble.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
            bubble.id = 'typing-bubble';
        } else {
            bubble.textContent = content;
        }

        row.appendChild(avatar);
        row.appendChild(bubble);
        messageList.appendChild(row);
        return row;
    }

    function scrollToBottom() {
        messageList.scrollTop = messageList.scrollHeight;
    }

    function autoResize() {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + 'px';
    }

    chatInput.addEventListener('input', autoResize);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.requestSubmit();
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        history.push({ role: 'user', content: text });
        appendMessageRow('user', text);
        saveHistory();

        chatInput.value = '';
        autoResize();
        scrollToBottom();

        btnSend.disabled = true;
        const typingRow = appendMessageRow('companion', '', { typing: true });
        scrollToBottom();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companion, messages: history }),
            });

            typingRow.remove();

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                appendMessageRow('companion', err.error || 'Something went wrong.', { error: true });
                return;
            }

            const data = await res.json();
            const reply = data.reply || '…';
            history.push({ role: 'assistant', content: reply });
            appendMessageRow('companion', reply);
            saveHistory();
        } catch (err) {
            typingRow.remove();
            appendMessageRow('companion', 'Could not reach the server. Is it running?', { error: true });
        } finally {
            btnSend.disabled = false;
            scrollToBottom();
        }
    });

    function init() {
        buildAvatarGrid();
        buildColorGrid();
        companion = loadCompanion();
        history = loadHistory();

        if (companion) {
            showChatScreen();
        } else {
            showSetupScreen(false);
        }
    }

    init();
})();
