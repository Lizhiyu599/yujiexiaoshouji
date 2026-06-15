// 玉界机 · 小组件面板逻辑

const addButton = document.getElementById('addButton');
const overlay = document.getElementById('overlay');
const panel = document.getElementById('panel');
const dragHandle = document.getElementById('dragHandle');

let isDragging = false;
let startY = 0;
let dragDistance = 0;

// ── 先改成点击触发测试 ──
let longPressTimer;
 const desktopStage = document.getElementById('desktopStage');
console.log('desktopStage:', desktopStage);

desktopStage.addEventListener('click', function(e) {
  addButton.classList.remove('hidden');
});

function openPanel() {
  panel.classList.remove('hidden');
  overlay.style.display = 'block';
  addButton.classList.add('hidden');
}

function closePanel() {
  panel.classList.add('hidden');
  overlay.style.display = 'none';
  addButton.classList.remove('hidden');
}

// 加号按钮
addButton.addEventListener('click', openPanel);

// 点击遮罩关闭
overlay.addEventListener('click', closePanel);

// 点击小导航条关闭
dragHandle.addEventListener('click', function(e) {
  if (dragDistance < 5) {
    closePanel();
  }
});

// 拖拽下滑关闭
dragHandle.addEventListener('touchstart', function(e) {
  isDragging = true;
  startY = e.touches[0].clientY;
  panel.style.transition = 'none';
});

dragHandle.addEventListener('touchmove', function(e) {
  if (!isDragging) return;
  var deltaY = e.touches[0].clientY - startY;
  dragDistance = Math.abs(deltaY);
  if (deltaY > 0) {
    panel.style.transform = 'translateX(-50%) translateY(' + deltaY + 'px)';
  }
});

dragHandle.addEventListener('touchend', function(e) {
  if (!isDragging) return;
  isDragging = false;
  panel.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)';
  var deltaY = e.changedTouches[0].clientY - startY;
  if (deltaY > 80) {
    closePanel();
  } else {
    panel.style.transform = 'translateX(-50%) translateY(0)';
  }
  setTimeout(function() { dragDistance = 0; }, 300);
});

// 折叠/展开（延迟执行，等待 DOM 渲染）
setTimeout(function() {
  document.querySelectorAll('.widget-header').forEach(function(header) {
    header.addEventListener('click', function() {
      var body = header.nextElementSibling;
      var icon = header.querySelector('.toggle-icon');
      if (body.classList.contains('open')) {
        body.classList.remove('open');
        icon.textContent = '›';
      } else {
        body.classList.add('open');
        icon.textContent = '∨';
      }
    });
  });
}, 200);
