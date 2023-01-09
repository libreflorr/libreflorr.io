const Controls = {
  // KeyW: { key: 'up' },
  // KeyS: { key: 'down' },
  // KeyA: { key: 'left' },
  // KeyD: { key: 'right' },
  // ArrowUp: { key: 'up' },
  // ArrowDown: { key: 'down' },
  // ArrowLeft: { key: 'left' },
  // ArrowRight: { key: 'right' },
};

// TODO: mobile input support

function trackKeys(event, input) {
  if (document.activeElement === ref.chat) {
    chatOpen = true;
  } else {
    chatOpen = false;
  }
  if (event.repeat && !chatOpen) return event.preventDefault();
  if (event.code === 'Enter') {
    if (chatOpen && event.type === 'keydown') {
      ref.chatDiv.classList.add('hidden');
      const text = ref.chat.value.trim();
      // if (text.toLowerCase() == '/help') {
      //     const div = document.createElement('div');
      //     div.classList.add('chat-message');
      //     div.innerHTML = `${'<span class="rainbow">[SERVER]</span> '}: <span style="color: #c4c4c4;">WASD or Arrow Keys to Move. You can also toggle mouse by clicking the screen. R to respawn.</span>`;
      //     ref.chatMessageDiv.appendChild(div);
      //     ref.chatMessageDiv.scrollTop = ref.chatMessageDiv.scrollHeight;
      // }
      send({ chat: text });
      chatOpen = false;
      ref.chat.value = '';
      ref.chat.blur();
    } else if (event.type === 'keydown') {
      chatOpen = true;
      ref.chatDiv.classList.remove('hidden');
      ref.chat.focus();
    }
    return;
  }
  if (chatOpen) return;
  if (Controls[event.code] != undefined) {
    input[Controls[event.code].key] = event.type === 'keydown';
    event.preventDefault();
  }
}

const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2,
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

ref.canvas.addEventListener('mousedown', (e) => {
  attacking = true;
  if (e.button === 0) {
    send({ attack: true });
  } else if (e.button === 2) {
    send({ defend: true });
  }
  event.preventDefault();
});

ref.canvas.addEventListener('mouseup', (e) => {
  attacking = false;
  if (e.button === 0) {
    send({ attack: false });
  } else if (e.button === 2) {
    send({ defend: false });
  }
  event.preventDefault();
});

window.addEventListener("contextmenu", e => e.preventDefault());

// window.addEventListener('mouseout', () => {
// 	mouse.x = canvas.width/2;
//     mouse.y = canvas.height/2;
// });