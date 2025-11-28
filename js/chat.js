window.initPublicChat = function () {
  /****************** CONFIG (your Firebase project) ******************/
  const firebaseConfig = {
    apiKey: "AIzaSyAaHeMAY83A4xH8u6-r58VsFCPvzvWNq5E",
    authDomain: "delta-42a39.firebaseapp.com",
    databaseURL: "https://delta-42a39-default-rtdb.firebaseio.com",
    projectId: "delta-42a39",
    storageBucket: "delta-42a39.firebasestorage.app",
    messagingSenderId: "195563321584",
    appId: "1:195563321584:web:e165313415041461cdaa35",
    measurementId: "G-RH60HFPM0N"
  };
  /*******************************************************************/

  // init firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  // --- Firebase References ---
  const publicChatRef = db.ref('public_chat');
  const publicTypingRef = db.ref('public_chat_typing');
  const roomsRef = db.ref('private_rooms'); 

  // --- UI elements ---
  const UI = {
      chatTitle: document.getElementById('chatTitle'),
      messages: document.getElementById('messages'),
      input: document.getElementById('messageInput'),
      sendBtn: document.getElementById('sendBtn'),
      usernameInput: document.getElementById('username'),
      setNameBtn: document.getElementById('setNameBtn'),
      anonBtn: document.getElementById('anonBtn'),
      clearBtn: document.getElementById('clearBtn'),
      status: document.getElementById('status'),
      channelStatus: document.getElementById('channelStatus'),
      typingIndicator: document.getElementById('typingIndicator'),
      roomCodeInput: document.getElementById('roomCodeInput'),
      joinRoomBtn: document.getElementById('joinRoomBtn'),
      createRoomBtn: document.getElementById('createRoomBtn'),
      // publicBtn: document.getElementById('publicBtn'), // *** REMOVED: No longer needed in composer area ***
      roomList: document.getElementById('roomList'), 
      publicChatButton: document.getElementById('publicChatButton'),
      chatSidebarBadge: document.getElementById('chat-notification-badge')
  };
  
  // *** NEW: Add click handler to the existing Public Chat Button in the room list ***
  if(UI.publicChatButton) {
      UI.publicChatButton.onclick = switchToPublic;
  }
  // *** END NEW ***

  // --- State Management ---
  const LS_NAME = 'public_chat_username_v1';
  const LS_ROOMS = 'joined_private_rooms';
  
  let State = {
    currentRoomCode: null,
    currentChatRef: publicChatRef,
    currentTypingRef: publicTypingRef,
    chatListeners: { added: null, changed: null, removed: null },
    typingListener: null,
    typingTimeout: null,
    // Maps room codes to their notification state: {code: {newMsgCount: number, typing: string[], isListening: bool}}
    roomNotifications: new Map(),
    // Maps room codes to their Firebase listener reference paths for cleanup
    roomListeners: new Map(), 
    renderedMessageIds: new Set(),
  };

  // Set initial username
  if(!localStorage.getItem(LS_NAME)){
    localStorage.setItem(LS_NAME, 'Guest' + Math.floor(Math.random()*9999));
  }
  UI.usernameInput.value = localStorage.getItem(LS_NAME);

  // --- Helpers ---
  function nowIso(){ return new Date().toISOString(); }
  function timeShort(iso){
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    } catch(e){ return ''; }
  }
  function makeAvatarLetter(name){ return (name||'?').slice(0,1).toUpperCase(); }
  function escapeHtml(str){
    return String(str || '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }
  function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
/** Checks if the user is currently viewing the main /chat page. */
function isChatActive() {
    // Note: We check window.location.pathname against '/chat'. This assumes SPA routing uses this path.
    return window.location.pathname === '/chat';
}

/** Updates the main sidebar chat notification badge. */
function updateSidebarNotification(totalNewMessages) {
    if (!UI.chatSidebarBadge) { return; }

    if (totalNewMessages > 0) {
        UI.chatSidebarBadge.textContent = totalNewMessages > 99 ? '99+' : totalNewMessages;
        UI.chatSidebarBadge.classList.remove('hidden');
    } else {
        UI.chatSidebarBadge.classList.add('hidden');
        UI.chatSidebarBadge.textContent = '0'; // Reset count
    }
}

/** Sums all new message counts and updates the main sidebar badge. */
function recalculateTotalNotifications() {
    // Only update the main sidebar badge if the chat page is NOT active.
    if (isChatActive()) {
        updateSidebarNotification(0); // Ensure the sidebar badge is clear if we are on the page
        return;
    }

    let total = 0;
    // Ensure 'PUBLIC' entry exists for total calculation
    if (!State.roomNotifications.has('PUBLIC')) {
        State.roomNotifications.set('PUBLIC', { newMsgCount: 0, typing: [], isListening: false });
    }
    State.roomNotifications.forEach(notif => {
        total += (notif.newMsgCount || 0);
    });
    updateSidebarNotification(total);
}

  /** Gets the list of joined room codes from localStorage. */
  function getJoinedRooms() {
    try {
      return JSON.parse(localStorage.getItem(LS_ROOMS) || '[]');
    } catch {
      return [];
    }
  }

  /** Adds a room code to the persistent list in localStorage. */
  function saveJoinedRoom(code) {
    let rooms = getJoinedRooms();
    if (!rooms.includes(code)) {
      rooms.push(code);
      localStorage.setItem(LS_ROOMS, JSON.stringify(rooms));
    }
  }

  /** Removes a room code from the persistent list in localStorage. */
  function removeJoinedRoom(code) {
    let rooms = getJoinedRooms();
    const index = rooms.indexOf(code);
    if (index > -1) {
      rooms.splice(index, 1);
      localStorage.setItem(LS_ROOMS, JSON.stringify(rooms));
    }
  }

  // --- UI Handlers ---
  UI.setNameBtn.onclick = () => {
    const v = UI.usernameInput.value.trim().slice(0,20);
    if(!v){ alert('Pick a name or use Anon.'); return; }
    localStorage.setItem(LS_NAME, v);
    UI.usernameInput.blur();
  };
  UI.anonBtn.onclick = () => {
    const anon = 'Anon' + Math.floor(Math.random()*999);
    UI.usernameInput.value = anon;
    UI.setNameBtn.click();
  };
  UI.clearBtn.onclick = () => { UI.messages.innerHTML = ''; };
  
  UI.createRoomBtn.onclick = () => {
    const newCode = generateRoomCode();
    const roomRef = roomsRef.child(newCode);

    roomRef.set({ name: `Room ${newCode}`, ts: nowIso() })
      .then(() => {
        UI.roomCodeInput.value = newCode;
        joinRoom(newCode); 
        showRoomCodeModal(newCode);
      })
      .catch(err => {
        alert('Failed to create room: ' + err.message);
        console.error(err);
      });
  };
  
  UI.joinRoomBtn.onclick = () => {
    const code = UI.roomCodeInput.value.trim().toUpperCase();
    if(code.length !== 6 || !/^[A-Z0-9]+$/.test(code)){
      alert('Room code must be a 6-character alphanumeric code.');
      return;
    }
    joinRoom(code);
  };
  // UI.publicBtn.onclick = switchToPublic; // *** REMOVED: Handled by the button in the room list now ***


  // --- Room List Logic ---

// *** NEW FEATURE: DELETE ROOM ***
function deleteRoom(code) {
    if (!confirm(`Are you sure you want to delete room ${code} and leave it? This will also remove the room from the database if you are the last person.`)) {
        return;
    }

    // 1. Clean up local storage and UI
    removeJoinedRoom(code);
    stopRoomMessageNotificationListeners(code); 
    const el = document.getElementById(`room-${code}`);
    if (el) el.remove();
    State.roomNotifications.delete(code);
    
    // 2. Check if the room is currently active and switch to public if so
    if (code === State.currentRoomCode) { 
        switchToPublic(); 
    }

    // 3. Delete the room data from Firebase (or mark as deleted/cleanup)
    // NOTE: For a real app, you'd want proper permissions/cleanup logic.
    // Here we assume the user has write access to the room ref.
    roomsRef.child(code).remove()
        .then(() => {
            alert(`Room ${code} removed.`);
            recalculateTotalNotifications();
        })
        .catch(err => {
            alert('Failed to delete room data: ' + err.message);
            console.error(err);
        });
}
// *** END NEW FEATURE ***

  /** Renders or updates a room button in the list. */
  function renderRoomInList(code, name, isActive) {
    let button = document.getElementById(`room-${code}`);
   
    if (!button) {
      button = document.createElement('button');
      button.id = `room-${code}`;
      button.dataset.code = code;
      button.onclick = () => joinRoom(code);
     
      UI.roomList.insertBefore(button, UI.publicChatButton ? UI.publicChatButton.nextSibling : UI.roomList.firstChild); 
    }

    // Update button content
    button.innerHTML = `🔒 ${escapeHtml(name)} <small>(${code})</small>`;
   
    // Add rename icon and logic
    const renameIcon = document.createElement('span');
    renameIcon.className = 'rename-icon';
    renameIcon.textContent = '✎';
    renameIcon.onclick = (e) => {
      e.stopPropagation(); 
      renameRoom(code, name);
    };
    button.appendChild(renameIcon);

    // *** NEW FEATURE: DELETE ROOM (Add delete icon) ***
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'rename-icon'; // Reuse styling class for float/hover
    deleteIcon.textContent = '🗑️';
    deleteIcon.title = 'Delete Room';
    deleteIcon.onclick = (e) => {
      e.stopPropagation(); 
      deleteRoom(code);
    };
    button.appendChild(deleteIcon);
    // *** END NEW FEATURE ***


    // Update active state
    if (isActive) {
        // *** MODIFIED: Clear active state on all room list buttons ***
      [...UI.roomList.querySelectorAll('button')].forEach(el => el.classList.remove('active'));
      button.classList.add('active');
      // UI.publicChatButton.classList.remove('active'); // No need to check, the loop above covers it
    } else {
      button.classList.remove('active');
    }

    // Re-apply notification state if present
    const notif = State.roomNotifications.get(code);
    if(notif) {
        setRoomNotification(code, notif.newMsgCount || 0, notif.typing); 
    }
  }

  /** Handles room renaming. */
  function renameRoom(code, currentName) {
    const newName = prompt(`Rename room ${code}. Current name: "${currentName}"`, currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      roomsRef.child(code).update({ name: newName.trim().slice(0, 30) })
        .catch(err => alert('Failed to rename room: ' + err.message));
    }
  }

  /** Detaches all notification/typing listeners for a specific room. */
  function stopRoomMessageNotificationListeners(roomCode) {
      if (State.roomListeners.has(roomCode)) {
          // Detach listeners on the specific paths.
          roomsRef.child(roomCode).child('messages').off('child_added'); 
          roomsRef.child(roomCode).child('typing').off('value');      
          
          State.roomListeners.delete(roomCode);
      }
  }


  /** Starts listening to the rooms reference for list updates. */
  function startListeningToRooms() {
    const joinedRooms = getJoinedRooms();
   
    joinedRooms.forEach(code => {
      // Start a dedicated listener for each joined room's metadata
      roomsRef.child(code).on('value', snap => {
        const roomData = snap.val();
        
        if(!roomData) {
          // Room was deleted remotely! Clean up local storage, UI, and listeners
          removeJoinedRoom(code);
          roomsRef.child(code).off(); // Detach room metadata listener
          stopRoomMessageNotificationListeners(code); // Stop background listeners
          const el = document.getElementById(`room-${code}`);
          if(el) el.remove();
          State.roomNotifications.delete(code);
          recalculateTotalNotifications();
          if (code === State.currentRoomCode) { switchToPublic(); }
          return;
        }

        const name = roomData.name || `Private Room ${code}`;
        
        // Render or update the room button
        renderRoomInList(code, name, code === State.currentRoomCode);
        
        // Ensure notification listeners are running
        const current = State.roomNotifications.get(code) || { newMsgCount: 0, typing: [] }; 
        if(!current.isListening) {
            startRoomMessageNotificationListener(code);
            // Mark as listening to prevent re-attaching the listener
            State.roomNotifications.set(code, { ...current, isListening: true });
            State.roomListeners.set(code, true); // Use a simple flag for tracking which rooms have listeners active
        }
      });
    });
  }


  // --- Notification Logic ---
  if (window.Notification && Notification.permission !== 'granted') {
    setTimeout(() => { 
        Notification.requestPermission(p => {
          if (p === 'denied') {
            console.warn("Notifications denied.");
          }
        });
    }, 2000);
  }
 
  /** Updates the visual notification state on a room button. */
  function setRoomNotification(code, newMsgCount, typingNames) { 
    if (!code) return; 
   
    const button = code === 'PUBLIC' ? UI.publicChatButton : document.getElementById(`room-${code}`); 
    if (!button) return;

    // 1. Handle the new message count badge (red circle with number) for the room button
    let badge = button.querySelector('.notification-badge');
    if (!badge) {
        // Create the badge if it doesn't exist (used for Public and Private Room buttons in the chat panel)
        badge = document.createElement('span');
        // This is a mix of tailwind/css variables, which is likely from another script/framework.
        // I will only set essential styles if it's missing, but it is expected to exist for full function.
        badge.className = 'notification-badge'; 
        badge.style.position = 'absolute';
        badge.style.top = '1px';
        badge.style.right = '2px';
        badge.style.width = '20px';
        badge.style.height = '20px';
        badge.style.background = 'var(--danger)';
        badge.style.borderRadius = '50%';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = 'bold';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.color = '#fff';
        badge.style.transform = 'translate(50%, -55%)'; // Move to top-right corner
        button.appendChild(badge);
    }

    // Only update the room button badge if we are NOT on the chat page.
    // The previous logic for badge display was likely flawed as the badge was always created/updated.
    // The visibility should be controlled by the `isChatActive` check.
    if (!isChatActive() || code !== State.currentRoomCode) { 
        if (newMsgCount > 0) {
            badge.textContent = newMsgCount > 9 ? '9+' : newMsgCount;
            badge.classList.remove('hidden');
            badge.style.display = 'flex'; // Ensure it's visible if count > 0
        } else {
            badge.classList.add('hidden');
            badge.style.display = 'none'; // Ensure it's hidden if count is 0
        }
    } else {
        // If chat is active AND this is the current room, hide the badge.
        badge.classList.add('hidden');
        badge.style.display = 'none';
    }


    // 2. Handle the "• Typing" text indicator in the small tag
    const hasNewMessage = newMsgCount > 0;
    const msgMark = hasNewMessage ? ' • New' : '';
    const typingMark = typingNames && typingNames.length > 0 ? ' • Typing' : '';
    // Use accent color if new messages OR typing
    const style = (hasNewMessage || (typingNames && typingNames.length > 0)) ? 'style="color: var(--accent); font-weight: 600;"' : ''; 

    // Find the <small> element and update it
    const smallEl = button.querySelector('small');
    if (smallEl) {
      // Get original code text from the button
      const originalCodeMatch = smallEl.textContent.match(/\(([A-Z0-9]+)\)/); 
      const originalCode = originalCodeMatch ? originalCodeMatch[0] : `(${code})`;
      
      // *** MODIFIED: Only display the notification/typing status if the room is NOT active ***
      let statusText = '';
      if(code !== State.currentRoomCode) {
         statusText = `${msgMark}${typingMark}`;
      }
      // Public room doesn't have a code in the small tag by default, so we'll check for it
      if (code === 'PUBLIC') {
          // If Public room, just use the status marks
          smallEl.innerHTML = `<span ${style}>${statusText}</span>`;
      } else {
          // If Private room, keep the code
          smallEl.innerHTML = `<span ${style}>${originalCode}${statusText}</span>`;
      }
    }
  }

/** Attaches a permanent listener to the public chat for new message notifications. */
function startPublicMessageNotificationListener() {
    const nameMe = localStorage.getItem(LS_NAME);
    const code = 'PUBLIC';
    
    // 1. Message listener for notifications
    publicChatRef.limitToLast(1).on('child_added', (snapshot) => { 
        const data = snapshot.val(); 
        
        // If the message is NOT from the current user AND the chat is NOT the active chat
        // *** MODIFIED: Check currentRoomCode against null for public chat ***
        if (data.name !== nameMe && State.currentRoomCode !== null) { 
            const current = State.roomNotifications.get(code) || { newMsgCount: 0, typing: [] }; 
            
            // Only update notification count if we are NOT on the chat page
            if (!isChatActive()) { 
                
                // Desktop Notification
                if (current.newMsgCount === 0 && Notification.permission === 'granted' && !document.hasFocus()) { 
                    new Notification(`Delta Chat: New message in Public Channel`, {
                        body: `${data.name}: ${data.text.slice(0, 50)}${data.text.length > 50 ? '...' : ''}`,
                    });
                }

                const newCount = current.newMsgCount + 1; 
                State.roomNotifications.set(code, { ...current, newMsgCount: newCount, isListening: true });
                
                setRoomNotification(code, newCount, current.typing); // Show the room button badge
                
                recalculateTotalNotifications(); // Update main sidebar badge
            }
        }
    });
    
    // 2. Typing listener for public chat (used to update the small room button badge)
    publicTypingRef.on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const nameMe = localStorage.getItem(LS_NAME);
        const names = Object.keys(data).filter(n => data[n] === true && n !== nameMe); // Exclude self
        
        const code = 'PUBLIC';
        const current = State.roomNotifications.get(code) || { newMsgCount: 0, typing: [] }; 
        State.roomNotifications.set(code, { ...current, typing: names });
        // *** MODIFIED: Check currentRoomCode against null for public chat ***
        if(State.currentRoomCode !== null) {
            setRoomNotification(code, current.newMsgCount, names); // Re-render typing indicator
        }
    });

    // Store listener paths for cleanup (though this one is permanent)
    State.roomListeners.set(code, true); // Simple flag
}


  /** Starts listening for new messages/typing in a room (when not active). */
  function startRoomMessageNotificationListener(roomCode) {
    const nameMe = localStorage.getItem(LS_NAME);

    // 1. Message listener
    roomsRef.child(roomCode).child('messages').limitToLast(1).on('child_added', (snapshot) => {
      const data = snapshot.val();

      // If the message is NOT from the current user AND the room is NOT the active room
      if (data.name !== nameMe && roomCode !== State.currentRoomCode) {
        // Get current notification state
        const current = State.roomNotifications.get(roomCode) || { newMsgCount: 0, typing: [] }; 
        
        // Only update notification count if we are NOT on the chat page
        if (!isChatActive()) {

            // Desktop Notification 
            if (current.newMsgCount === 0 && Notification.permission === 'granted' && !document.hasFocus()) { 
                new Notification(`Delta Chat: New message in ${roomCode}`, {
                    body: `${data.name}: ${data.text.slice(0, 50)}${data.text.length > 50 ? '...' : ''}`,
                });
            }
            
            // Update state and UI (Increment count)
            const newCount = current.newMsgCount + 1;
            State.roomNotifications.set(roomCode, { 
                ...current,
                newMsgCount: newCount
            });
            setRoomNotification(roomCode, newCount, current.typing); 
            recalculateTotalNotifications(); // Update main sidebar badge
        }
      }
    });
   
    // 2. Typing listener
    roomsRef.child(roomCode).child('typing').on('value', (snap) => {
      const data = snap.val() || {};
      // Filter out our own typing status
      const namesTyping = Object.keys(data).filter(n => data[n] === true && n !== nameMe);
     
      // Only update notification status if the room is NOT the active room
      if (roomCode !== State.currentRoomCode) {
        const current = State.roomNotifications.get(roomCode) || { newMsgCount: 0, typing: [] }; 
        State.roomNotifications.set(roomCode, { newMsgCount: current.newMsgCount, typing: namesTyping, isListening: true }); 
        setRoomNotification(roomCode, current.newMsgCount, namesTyping); 
      }
    });
  }


  // --- Core Channel Switching Logic ---

  /**
   * Switches the active chat channel.
   */
  function switchToChannel(chatRef, typingRef, roomCode, title, statusText, inputPlaceholder){
    // 1. Detach old listeners
    if(State.chatListeners.added) State.currentChatRef.off('child_added', State.chatListeners.added);
    if(State.chatListeners.changed) State.currentChatRef.off('child_changed', State.chatListeners.changed);
    if(State.chatListeners.removed) State.currentChatRef.off('child_removed', State.chatListeners.removed);
    if(State.typingListener) State.currentTypingRef.off('value', State.typingListener);

    // 2. Update state and UI
    State.currentChatRef = chatRef;
    State.currentTypingRef = typingRef;
    State.currentRoomCode = roomCode;
    UI.chatTitle.textContent = title;
    UI.channelStatus.textContent = statusText;
    UI.input.placeholder = inputPlaceholder;
    // UI.publicBtn.style.display = roomCode ? 'block' : 'none'; // *** REMOVED: No longer needed ***

    // 3. Re-attach new listeners and clear messages
    UI.messages.innerHTML = '';
    State.renderedMessageIds.clear();
    startListeningToChat();
    startListeningToTyping();
  }

  /** Sets the chat to the public channel. */
  function switchToPublic(){
    // *** MODIFIED: Set public button to active and clear all others ***
    [...UI.roomList.querySelectorAll('button')].forEach(el => el.classList.remove('active'));
    if(UI.publicChatButton) {
        UI.publicChatButton.classList.add('active'); 
    }
    // *** END MODIFIED ***
    
    // Reset notification count for public chat
    const code = 'PUBLIC'; // Use 'PUBLIC' for map key internally
    const current = State.roomNotifications.get(code) || { newMsgCount: 0, typing: [], isListening: false };
    State.roomNotifications.set(code, { ...current, newMsgCount: 0, isListening: true });
    setRoomNotification(code, 0, current.typing); // Reset badge for public button
    recalculateTotalNotifications(); // Update main sidebar badge (which should clear if isChatActive is true)

    switchToChannel(
      publicChatRef,
      publicTypingRef,
      null, // Keep null so private room check logic knows it's public
      'Delta Chat',
      'Public channel • everyone can read & post',
      'Message Public Channel... (Shift+Enter for newline)'
    );
  }

  /** Joins a private room. */
  function joinRoom(code){
    const roomRef = roomsRef.child(code); 
    const privateChatRef = roomRef.child('messages');
    const privateTypingRef = roomRef.child('typing');

    roomRef.once('value', snap => {
      const roomData = snap.val();
      if(!roomData) {
        alert(`Room ${code} does not exist or has been deleted.`);
        switchToPublic();
        return;
      }
      const roomName = roomData.name || `Private Room ${code}`;

      // Save the joined room to localStorage immediately!
      saveJoinedRoom(code); 
     
      switchToChannel(
        privateChatRef,
        privateTypingRef,
        code,
        `Delta Chat`,
        `Private room: ${code} • only people with code can read/post`,
        `Message ${code}... (Shift+Enter for newline)`
      );
     
      // Update the room list button to show active state
      renderRoomInList(code, roomName, true);
      
      // Clear notifications on entry and ensure listener is running
      const current = State.roomNotifications.get(code) || { newMsgCount: 0, typing: [] }; 
      State.roomNotifications.set(code, { ...current, newMsgCount: 0, isListening: true }); 
      setRoomNotification(code, 0, current.typing); 
      
      recalculateTotalNotifications(); // Update main sidebar badge (which should clear if isChatActive is true)

      // If we joined a room not on the list (e.g., via code), we need to ensure its listeners are active
      if (!current.isListening) {
          startRoomMessageNotificationListener(code);
          State.roomListeners.set(code, true);
      }
      
    }).catch(err => {
      console.error(err);
      switchToPublic(); 
    });
  }

  // --- Modal for Room Code Display ---
  function showRoomCodeModal(code) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <h2>Room Created!</h2>
        <p>Share this **private code** with your friends. Anyone that doesn't have it can't join.</p>
        <pre>${code}</pre>
        <button id="copyCodeBtn">Copy Code</button>
        <button onclick="document.body.removeChild(this.closest('.modal-overlay'));" class="ghost">Got it</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Copy to clipboard logic
    document.getElementById('copyCodeBtn').onclick = () => {
      navigator.clipboard.writeText(code)
        .then(() => {
          document.getElementById('copyCodeBtn').textContent = 'Copied!';
          setTimeout(() => document.body.removeChild(overlay), 1000);
        })
        .catch(err => {
          alert('Could not copy code. Please copy manually: ' + code);
          console.error('Copy failed:', err);
        });
    };
  }

  // --- Send Message ---
  function sendMessage(){
    const raw = UI.input.value;
    if(!raw || !raw.trim()) return;
    const sender = localStorage.getItem(LS_NAME) || ('Guest'+Math.floor(Math.random()*9999));
    const payload = { name: sender, text: raw.trim(), ts: nowIso() };
    
    State.currentChatRef.push(payload).catch(err => {
      console.error('push failed', err);
      alert('Failed to send — check firebase config & rules.');
    });
    UI.input.value = '';
    // clear typing flag immediately
    if(sender) State.currentTypingRef.child(sender).set(false);
    clearTimeout(State.typingTimeout);
  }
  UI.sendBtn.onclick = sendMessage;
  UI.input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
  });

  // --- Typing Indicator Logic ---
  function updateTypingStatus(){
    const name = localStorage.getItem(LS_NAME) || "Guest" + Math.floor(Math.random()*9999);
    State.currentTypingRef.child(name).set(true);
    clearTimeout(State.typingTimeout);
    State.typingTimeout = setTimeout(() => State.currentTypingRef.child(name).set(false), 1500);
  }
  
  // show typing people listener
  function startListeningToTyping(){
    State.typingListener = State.currentTypingRef.on('value', snap => {
      const data = snap.val() || {};
      const nameMe = localStorage.getItem(LS_NAME);
      const names = Object.keys(data).filter(n => data[n] === true && n !== nameMe); // Exclude self
      
      if(names.length === 0){ UI.typingIndicator.textContent = ''; return; }
      if(names.length === 1) UI.typingIndicator.textContent = `${names[0]} is typing…`;
      else if(names.length <= 3) UI.typingIndicator.textContent = `${names.join(', ')} are typing…`;
      else UI.typingIndicator.textContent = `Several people are typing…`;
    });
  }

  // connection status watcher
  const connectedRef = db.ref('.info/connected');
  connectedRef.on('value', snap => {
    const v = snap.val();
    UI.status.textContent = v ? 'Online' : 'Offline';
  });

  /****************** Message rendering & editing ******************/
  
  // append message: data + id
  function appendMessage({name, text, ts, edited, editedTs}, id){
    if(!id || State.renderedMessageIds.has(id)){
      if(State.renderedMessageIds.has(id)) return;
    }

    const me = (localStorage.getItem(LS_NAME) || '').toLowerCase();
    const isMe = me && name && (name.toLowerCase() === me);

    const wrap = document.createElement('div');
    wrap.className = 'msg' + (isMe ? ' you' : '');
    wrap.dataset.id = id;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = makeAvatarLetter(name||'G');

    const body = document.createElement('div');

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = escapeHtml(text).replace(/\n/g,'<br>');

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${name || 'Guest'} • ${timeShort(ts || nowIso())}`;

    if(edited){
      const tag = document.createElement('span');
      tag.className = 'editedTag';
      tag.textContent = 'edited';
      meta.appendChild(tag);
    }

    // if it's the user's message, add edit button
    if(isMe){
      const editBtn = document.createElement('span');
      editBtn.textContent = "✎";
      editBtn.title = "Edit message";
      editBtn.style.cursor = "pointer";
      editBtn.style.opacity = "0.75";
      editBtn.style.fontSize = "13px";
      editBtn.style.marginLeft = "6px";
      editBtn.onclick = () => startEditingMessage(id);
      meta.appendChild(editBtn);
      
      // *** NEW FEATURE: DELETE MESSAGE ***
      const deleteMsgBtn = document.createElement('span');
      deleteMsgBtn.textContent = "✖";
      deleteMsgBtn.title = "Delete message";
      deleteMsgBtn.style.cursor = "pointer";
      deleteMsgBtn.style.opacity = "0.75";
      deleteMsgBtn.style.fontSize = "13px";
      deleteMsgBtn.style.marginLeft = "8px";
      deleteMsgBtn.onclick = (event) => {
  event.stopPropagation();

  if(event.shiftKey){
    // Shift+click: delete immediately without confirmation
    State.currentChatRef.child(id).remove().catch(err => {
      alert('Failed to delete message: ' + err.message);
    });
  } else {
    // Normal click: show confirmation
    if(confirm('Are you sure you want to delete this message? Tip: Shift+click to remove without confirmation.')){
      State.currentChatRef.child(id).remove().catch(err => {
        alert('Failed to delete message: ' + err.message);
      });
    }
  }
};
      meta.appendChild(deleteMsgBtn);
      // *** END NEW FEATURE ***
    }

    body.appendChild(bubble);
    body.appendChild(meta);

    wrap.appendChild(avatar);
    wrap.appendChild(body);

    UI.messages.appendChild(wrap);
    // maintain scroll
    UI.messages.scrollTop = UI.messages.scrollHeight;

    State.renderedMessageIds.add(id);
  }
  
  // Helper function to set up chat listeners (Uses currentChatRef)
  function startListeningToChat(){
    // Clear previous set of rendered IDs and the display before listening.
    State.renderedMessageIds.clear(); 
    UI.messages.innerHTML = '';
    
    // Listener for new messages (changed limit from 3 to 50 for better history)
    State.currentChatRef.limitToLast(100).on('child_added', State.chatListeners.added = (snapshot) => {
  const data = snapshot.val();
  appendMessage(data, snapshot.key);
});

    // Listener for edits/changes
    State.currentChatRef.on('child_changed', State.chatListeners.changed = (snapshot) => {
      const id = snapshot.key;
      const data = snapshot.val();
      // find the message element
      const msgEl = [...UI.messages.children].find(el => el.dataset && el.dataset.id === id);
      if(!msgEl){
        // not in DOM yet, just append
        appendMessage(data, id);
        return;
      }
      // restore original bubble if it was an editor textarea
      let bubble = msgEl.querySelector('.bubble');
      if(!bubble){
        // If the bubble doesn't exist, it means an editor is active.
        const textarea = msgEl.querySelector('textarea');
        if(textarea){
          // Remove editor and controls
          const controls = msgEl.querySelector('.edit-controls');
          if(controls) controls.remove();
          bubble = document.createElement('div');
          bubble.className = 'bubble';
          textarea.replaceWith(bubble);
        }
      }
      // update bubble content
      if(bubble){
        bubble.innerHTML = escapeHtml(data.text).replace(/\n/g,'<br>');
      }
      
      // update meta edited tag
      const meta = msgEl.querySelector('.meta');
      if(meta){
        // remove existing edit button and edited tag before rebuilding meta
        const oldTag = meta.querySelector('.editedTag');
        if(oldTag) oldTag.remove();
        const oldEditBtn = meta.querySelector('span[title="Edit message"]');
        if(oldEditBtn) oldEditBtn.remove();
        // *** NEW: Remove old delete button if it exists ***
        const oldDeleteBtn = meta.querySelector('span[title="Delete message"]');
        if(oldDeleteBtn) oldDeleteBtn.remove();
        // *** END NEW ***
        
        // replace meta text
        meta.textContent = `${data.name || 'Guest'} • ${timeShort(data.ts || nowIso())}`;
        
        if(data.edited){
          const tag = document.createElement('span');
          tag.className = 'editedTag';
          tag.textContent = 'edited';
          meta.appendChild(tag);
        }
        
        // if this is user's message, add edit button back
        const me = (localStorage.getItem(LS_NAME) || '').toLowerCase();
        if(me && data.name && data.name.toLowerCase() === me){
          const editBtn = document.createElement('span');
          editBtn.textContent = "✎";
          editBtn.title = "Edit message";
          editBtn.style.cursor = "pointer";
          editBtn.style.opacity = "0.75";
          editBtn.style.fontSize = "13px";
          editBtn.style.marginLeft = "6px";
          editBtn.onclick = () => startEditingMessage(id);
          meta.appendChild(editBtn);

          // *** NEW: Add delete button back ***
          const deleteMsgBtn = document.createElement('span');
          deleteMsgBtn.textContent = "✖";
          deleteMsgBtn.title = "Delete message";
          deleteMsgBtn.style.cursor = "pointer";
          deleteMsgBtn.style.opacity = "0.75";
          deleteMsgBtn.style.fontSize = "13px";
          deleteMsgBtn.style.marginLeft = "8px";
          deleteMsgBtn.onclick = (event) => {
  event.stopPropagation();

  if(event.shiftKey){
    // Shift+click: delete immediately without confirmation
    State.currentChatRef.child(id).remove().catch(err => {
      alert('Failed to delete message: ' + err.message);
    });
  } else {
    // Normal click: show confirmation
    if(confirm('Are you sure you want to delete this message? Tip: Shift+click to remove without confirmation.')){
      State.currentChatRef.child(id).remove().catch(err => {
        alert('Failed to delete message: ' + err.message);
      });
    }
  }
};
          meta.appendChild(deleteMsgBtn);
          // *** END NEW ***
        }
      }
    });

    // optional: child_removed (if you later implement delete)
    State.currentChatRef.on('child_removed', State.chatListeners.removed = (snapshot) => {
      const id = snapshot.key;
      const msgEl = [...UI.messages.children].find(el => el.dataset && el.dataset.id === id);
      if(msgEl) msgEl.remove();
      State.renderedMessageIds.delete(id);
    });
  }


  // editing flow: loads latest text from DB, allows editing, saves update
  function startEditingMessage(id){
    const msgEl = [...UI.messages.children].find(el => el.dataset && el.dataset.id === id);
    if(!msgEl) return;
    const bubble = msgEl.querySelector('.bubble');
    if(!bubble) return;

    // fetch latest content from DB to avoid stale edit
    State.currentChatRef.child(id).once('value').then(snap => {
      const data = snap.val() || {};
      const originalText = data.text || '';

      // build editor UI
      const textarea = document.createElement('textarea');
      textarea.value = originalText;
      textarea.style.width = "100%";
      textarea.style.minHeight = "48px";
      textarea.style.borderRadius = "6px";
      textarea.style.padding = "6px";
      textarea.style.resize = "vertical";
      
      // replace bubble with editor
      bubble.replaceWith(textarea);

      const controls = document.createElement('div');
      controls.className = 'edit-controls';

      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.className = 'ghost';

      controls.appendChild(saveBtn);
      controls.appendChild(cancelBtn);

      // append controls after textarea inside message body
      const body = msgEl.querySelector('div:nth-child(2)');
      body.appendChild(controls);

      // handlers
      cancelBtn.onclick = () => {
        // restore original bubble
        const newBubble = document.createElement('div');
        newBubble.className = 'bubble';
        newBubble.innerHTML = escapeHtml(originalText).replace(/\n/g,'<br>');
        textarea.replaceWith(newBubble);
        controls.remove();
        // Manually trigger update to restore edit/delete button if needed
        State.currentChatRef.child(id).once('value', snap => {
          State.chatListeners.changed(snap);
        });
      };

      saveBtn.onclick = () => {
        const newText = textarea.value.trim();
        if(newText.length === 0){
          alert('Message cannot be empty.');
          return;
        }
        const updatePayload = {
          text: newText,
          edited: true,
          editedTs: nowIso()
        };
        State.currentChatRef.child(id).update(updatePayload).then(() => {
          controls.remove();
        }).catch(err => {
          console.error('update failed', err);
          alert('Failed to save edit.');
        });
      };

      // keyboard: Ctrl+Enter to save
      textarea.addEventListener('keydown', e => {
        if(e.key === 'Enter' && (e.ctrlKey || e.metaKey)){
          e.preventDefault();
          saveBtn.click();
        }
      });

      // focus
      textarea.focus();
    }).catch(err => {
      console.error('failed to fetch message for edit', err);
    });
  }

  // small UX: press / to focus input
  window.addEventListener('keydown', e=>{
    if(e.key === '/' && document.activeElement !== UI.input && document.activeElement !== UI.usernameInput && document.activeElement !== UI.roomCodeInput){
      e.preventDefault();
      UI.input.focus();
    }
  });

  // bootstrap: start in public chat
  
  // 1. Load rooms from localStorage and start listening to their Firebase metadata
  startListeningToRooms(); 
  
  // 2. Start permanent public chat notification listener
  startPublicMessageNotificationListener(); 
  
  // 3. Then, switch to public chat
  switchToPublic(); 

  UI.input.addEventListener('input', updateTypingStatus); 
};
