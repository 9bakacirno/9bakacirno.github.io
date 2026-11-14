
/* =====================================
   9BAKACIRNO PERSONAL PAGE
   Cirno × Remilia
===================================== */


/* =========================
   SNOW / ICE PARTICLES
========================= */

const particleContainer = document.getElementById("particles");

const particleSymbols = ["❄", "✦", "✧", "·"];

function createParticle() {
    if (!particleContainer) return;

    const particle = document.createElement("div");
    particle.className = "particle";

    particle.textContent =
        particleSymbols[Math.floor(Math.random() * particleSymbols.length)];

    particle.style.left = Math.random() * 100 + "vw";
    particle.style.fontSize = (Math.random() * 14 + 8) + "px";
    particle.style.animationDuration = (Math.random() * 8 + 7) + "s";
    particle.style.animationDelay = Math.random() * 5 + "s";

    particleContainer.appendChild(particle);

    setTimeout(() => particle.remove(), 16000);
}

setInterval(createParticle, 350);


/* =========================
   TWO INDEPENDENT MUSIC PLAYERS
========================= */

/* One droplet toggles both windows; each × closes only its own window. */
(() => {
    const toggle = document.getElementById("musicToggle");
    const menuPanel = document.getElementById("menuMusicPanel");
    const awfulPanel = document.getElementById("awfulMusicPanel");
    const menuClose = document.getElementById("menuMusicClose");
    const awfulClose = document.getElementById("awfulMusicClose");
    if (!toggle || !menuPanel || !awfulPanel) return;

    function syncToggleState() {
        const anyOpen = !menuPanel.hidden || !awfulPanel.hidden;
        toggle.setAttribute("aria-expanded", String(anyOpen));
        toggle.classList.toggle("is-open", anyOpen);
        const widget = toggle.closest(".shared-music-widget");
        if (widget) widget.classList.toggle("is-expanded", anyOpen);
    }
    function closeBoth() {
        menuPanel.hidden = true;
        awfulPanel.hidden = true;
        syncToggleState();
    }
    toggle.addEventListener("click", () => {
        const bothOpen = !menuPanel.hidden && !awfulPanel.hidden;
        if (bothOpen) closeBoth();
        else {
            menuPanel.hidden = false;
            awfulPanel.hidden = false;
            syncToggleState();
        }
    });
    if (menuClose) menuClose.addEventListener("click", () => {
        menuPanel.hidden = true;
        syncToggleState();
    });
    if (awfulClose) awfulClose.addEventListener("click", () => {
        awfulPanel.hidden = true;
        syncToggleState();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeBoth();
    });
})();

function formatMusicTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function setupAudioControls(config) {
    const audio = document.getElementById(config.audioId);
    const button = document.getElementById(config.buttonId);
    const progress = document.getElementById(config.progressId);
    const currentTime = document.getElementById(config.currentTimeId);
    const duration = document.getElementById(config.durationId);
    const status = document.getElementById(config.statusId);
    if (!audio || !button) return null;

    function updateButton() {
        button.textContent = audio.paused ? "▶ Play" : "⏸ Pause";
    }
    function updateProgress() {
        const total = audio.duration;
        if (Number.isFinite(total) && total > 0) {
            if (progress) progress.value = audio.currentTime / total * 100;
            if (currentTime) currentTime.textContent = formatMusicTime(audio.currentTime);
            if (duration) duration.textContent = formatMusicTime(total);
        } else {
            if (progress) progress.value = 0;
            if (currentTime) currentTime.textContent = formatMusicTime(0);
            if (duration) duration.textContent = "0:00";
        }
    }
    button.addEventListener("click", async () => {
        if (audio.paused) {
            try { await audio.play(); }
            catch (_) { if (status) status.textContent = "Playback blocked or audio file unavailable — click Play again."; }
        } else audio.pause();
        updateButton();
    });
    audio.addEventListener("play", () => {
        updateButton();
        if (status) status.textContent = config.playingText;
    });
    audio.addEventListener("pause", updateButton);
    audio.addEventListener("ended", updateButton);
    audio.addEventListener("timeupdate", () => { updateProgress(); if (config.onTimeUpdate) config.onTimeUpdate(); });
    audio.addEventListener("loadedmetadata", () => { updateProgress(); if (config.onTimeUpdate) config.onTimeUpdate(); });
    audio.addEventListener("durationchange", updateProgress);
    if (progress) progress.addEventListener("input", () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime = Number(progress.value) / 100 * audio.duration;
            updateProgress();
            if (config.onTimeUpdate) config.onTimeUpdate();
        }
    });
    return { audio, updateButton, updateProgress };
}

const menuPlayer = setupAudioControls({
    audioId: "menuAudio",
    buttonId: "menuPlayButton",
    progressId: "menuProgressBar",
    currentTimeId: "menuCurrentTime",
    durationId: "menuDuration",
    statusId: "menuStatus",
    playingText: "♪ Playing Menu OST"
});

/* AWFUL: restore normal/slowed versions and synchronized .lrc lyrics. */
const awfulAudioElement = document.getElementById("awfulAudio");
const awfulStatus = document.getElementById("awfulStatus");
const awfulLyricsDisplay = document.getElementById("awfulLyricsDisplay");
const awfulNormalButton = document.getElementById("awfulNormalButton");
const awfulSlowedButton = document.getElementById("awfulSlowedButton");
let awfulVersion = "normal";
let awfulLyricLines = [];
let awfulLyricElements = [];
let awfulNormalDuration = 136;

function parseAwfulLrc(text) {
    const lines = [];
    for (const line of text.split(/\r?\n/)) {
        const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
        if (!matches.length) continue;
        const lyric = line.replace(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g, "").trim();
        for (const match of matches) {
            const fraction = (match[3] || "0").padEnd(3, "0");
            lines.push({ time: Number(match[1]) * 60 + Number(match[2]) + Number(fraction) / 1000, text: lyric });
        }
    }
    return lines.sort((a, b) => a.time - b.time);
}
function renderAwfulLyrics() {
    if (!awfulLyricsDisplay) return;
    awfulLyricsDisplay.replaceChildren();
    awfulLyricElements = [];
    if (!awfulLyricLines.length) {
        const p = document.createElement("p");
        p.className = "lyric-line";
        p.textContent = "No lyrics found.";
        awfulLyricsDisplay.appendChild(p);
        return;
    }
    awfulLyricLines.forEach((line) => {
        const p = document.createElement("p");
        p.className = "lyric-line";
        p.textContent = line.text || "♪";
        awfulLyricsDisplay.appendChild(p);
        awfulLyricElements.push(p);
    });
    updateAwfulLyrics();
}
function updateAwfulLyrics() {
    if (!awfulAudioElement || !awfulLyricsDisplay || !awfulLyricLines.length) return;
    if (awfulVersion === "normal" && Number.isFinite(awfulAudioElement.duration) && awfulAudioElement.duration > 0) {
        awfulNormalDuration = awfulAudioElement.duration;
    }
    let lyricTime = awfulAudioElement.currentTime;
    if (awfulVersion === "slowed" && Number.isFinite(awfulAudioElement.duration) && awfulAudioElement.duration > 0 && awfulNormalDuration > 0) {
        lyricTime *= awfulNormalDuration / awfulAudioElement.duration;
    }
    let active = -1;
    for (let i = 0; i < awfulLyricLines.length; i++) {
        if (awfulLyricLines[i].time <= lyricTime) active = i;
        else break;
    }
    awfulLyricElements.forEach((el) => el.classList.remove("active"));
    if (active >= 0 && awfulLyricElements[active]) {
        const el = awfulLyricElements[active];
        el.classList.add("active");
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}
if (awfulLyricsDisplay) {
    fetch("awful.lrc").then((response) => {
        if (!response.ok) throw new Error("Could not load awful.lrc");
        return response.text();
    }).then((text) => {
        awfulLyricLines = parseAwfulLrc(text);
        renderAwfulLyrics();
    }).catch((error) => {
        awfulLyricsDisplay.textContent = "Lyrics unavailable.";
        console.error("AWFUL lyrics loading failed:", error);
    });
}

const awfulPlayer = setupAudioControls({
    audioId: "awfulAudio",
    buttonId: "awfulPlayButton",
    progressId: "awfulProgressBar",
    currentTimeId: "awfulCurrentTime",
    durationId: "awfulDuration",
    statusId: "awfulStatus",
    playingText: "♪ Playing AWFUL — nicopatty",
    onTimeUpdate: updateAwfulLyrics
});

async function setAwfulVersion(version) {
    if (!awfulAudioElement || version === awfulVersion) return;
    const wasPlaying = !awfulAudioElement.paused;
    const oldDuration = awfulAudioElement.duration;
    const oldTime = awfulAudioElement.currentTime;
    const ratio = Number.isFinite(oldDuration) && oldDuration > 0 ? oldTime / oldDuration : 0;
    awfulVersion = version;
    awfulAudioElement.pause();
    awfulAudioElement.src = version === "slowed" ? "awful-slowed.mp3" : "awful.mp3";
    awfulAudioElement.load();
    awfulAudioElement.addEventListener("loadedmetadata", async function restorePosition() {
        awfulAudioElement.removeEventListener("loadedmetadata", restorePosition);
        if (Number.isFinite(awfulAudioElement.duration) && awfulAudioElement.duration > 0) {
            awfulAudioElement.currentTime = ratio * awfulAudioElement.duration;
        }
        if (awfulNormalButton) awfulNormalButton.classList.toggle("active", version === "normal");
        if (awfulSlowedButton) awfulSlowedButton.classList.toggle("active", version === "slowed");
        if (awfulStatus) awfulStatus.textContent = version === "slowed" ? "AWFUL — nicopatty · Slowed" : "AWFUL — nicopatty · Normal";
        if (awfulPlayer) awfulPlayer.updateProgress();
        updateAwfulLyrics();
        if (wasPlaying) {
            try { await awfulAudioElement.play(); }
            catch (_) { if (awfulStatus) awfulStatus.textContent = "Click Play to resume AWFUL."; }
        }
    }, { once: true });
    if (awfulNormalButton) awfulNormalButton.classList.toggle("active", version === "normal");
    if (awfulSlowedButton) awfulSlowedButton.classList.toggle("active", version === "slowed");
}
if (awfulNormalButton) awfulNormalButton.addEventListener("click", () => setAwfulVersion("normal"));
if (awfulSlowedButton) awfulSlowedButton.addEventListener("click", () => setAwfulVersion("slowed"));

/* Try Menu autoplay only; browsers may block audible autoplay. */
if (menuPlayer) {
    menuPlayer.audio.play().catch(() => {
        const status = document.getElementById("menuStatus");
        if (status) status.textContent = "Menu OST · Click Play to start";
    });
}


/* =========================
   BAKA BUTTON
========================= */

const bakaButton = document.getElementById("bakaButton");
const bakaText = document.getElementById("bakaText");

let clickCount = 0;

if (bakaButton && bakaText) {
    bakaButton.addEventListener("click", () => {
        clickCount++;

        const messages = [
            "BAKA! ❄️",
            "⑨",
            "You actually clicked it.",
            "Cirno approves.",
            "The strongest has noticed you.",
            "🦇 ...Remilia is watching.",
            "okay stop clicking it 😭"
        ];

        if (clickCount <= messages.length) {
            bakaText.textContent = messages[clickCount - 1];
        } else {
            bakaText.textContent = "⑨⑨⑨⑨⑨⑨⑨";
        }
    });
}


/* =========================
   KONAMI-STYLE SECRET
========================= */

const secretCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight"
];

let secretInput = [];

document.addEventListener("keydown", (event) => {
    secretInput.push(event.key);

    if (secretInput.length > secretCode.length) {
        secretInput.shift();
    }

    const match = secretCode.every(
        (key, index) => secretInput[index] === key
    );

    if (match) {
        document.body.style.transform = "rotate(0.5deg)";

        setTimeout(() => {
            document.body.style.transform = "rotate(-0.5deg)";
        }, 100);

        setTimeout(() => {
            document.body.style.transform = "rotate(0deg)";
        }, 200);

        if (bakaText) {
            bakaText.textContent = "❄️ SECRET ICE MAGIC UNLOCKED ❄️";
        }

        secretInput = [];
    }
});


/* =========================
   RANDOM PAGE TITLE
========================= */

const titles = [
    "9bakacirno ❄️",
    "⑨ BAKA!",
    "❄️ Cirno's Website",
    "🦇 Scarlet Devil Mansion",
    "Gensokyo Internet"
];

let titleIndex = 0;

setInterval(() => {
    titleIndex++;

    if (titleIndex >= titles.length) {
        titleIndex = 0;
    }

    document.title = titles[titleIndex];
}, 5000);


/* =========================
   DRAG THE SHARED MUSIC DROPLET
   Both windows are children of this widget, so they move together.
========================= */
(() => {
    const widget = document.querySelector(".shared-music-widget");
    if (!widget) return;
    const handle = widget.querySelector(".music-toggle");
    const heading = widget.querySelector(".music-widget-heading");
    if (!handle) return;

    const storageKey = "cirnoMusicWidgetPosition:shared";
    let drag = null;
    let suppressClick = false;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    function applyPosition(left, top, dock = null) {
        const maxLeft = Math.max(0, window.innerWidth - widget.offsetWidth);
        const maxTop = Math.max(8, window.innerHeight - widget.offsetHeight - 8);
        left = clamp(left, 0, maxLeft);
        top = clamp(top, 8, maxTop);
        const dockLeft = dock === "left" ? -22 : dock === "right" ? window.innerWidth - widget.offsetWidth + 22 : left;
        widget.style.left = clamp(dockLeft, dock ? -22 : 0, dock ? window.innerWidth - widget.offsetWidth + 22 : maxLeft) + "px";
        widget.style.right = "auto";
        widget.style.top = top + "px";
        widget.style.transform = "none";
        widget.classList.toggle("docked-left", dock === "left");
        widget.classList.toggle("docked-right", dock === "right");
        try {
            localStorage.setItem(storageKey, JSON.stringify({ left: dock === "left" ? 0 : maxLeft, top, dock: dock || "right" }));
        } catch (_) {}
    }
    function restorePosition() {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch (_) {}
        if (saved && Number.isFinite(saved.top)) {
            applyPosition(saved.left || 0, saved.top, saved.dock === "left" ? "left" : "right");
        } else {
            const defaultTop = Number(widget.dataset.defaultTop || 50) / 100 * window.innerHeight;
            applyPosition(window.innerWidth - widget.offsetWidth, defaultTop, "right");
        }
    }
    function startDrag(event, source) {
        if (event.button !== undefined && event.button !== 0) return;
        if (source === heading && event.target.closest("button")) return;
        const rect = widget.getBoundingClientRect();
        drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, moved: false };
        if (source.setPointerCapture && event.pointerId !== undefined) {
            try { source.setPointerCapture(event.pointerId); } catch (_) {}
        }
        /* Do not preventDefault on pointerdown: a simple tap must still click the droplet. */
    }
    function moveDrag(event) {
        if (!drag || (drag.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
        if (!drag.moved) return;
        event.preventDefault();
        const maxLeft = Math.max(0, window.innerWidth - widget.offsetWidth);
        const maxTop = Math.max(8, window.innerHeight - widget.offsetHeight - 8);
        widget.style.left = clamp(drag.left + dx, 0, maxLeft) + "px";
        widget.style.right = "auto";
        widget.style.top = clamp(drag.top + dy, 8, maxTop) + "px";
        widget.style.transform = "none";
        widget.classList.remove("docked-left", "docked-right");
    }
    function endDrag(event) {
        if (!drag || (drag.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
        const moved = drag.moved;
        const rect = widget.getBoundingClientRect();
        const dock = rect.left + rect.width / 2 < window.innerWidth / 2 ? "left" : "right";
        const top = clamp(rect.top, 8, window.innerHeight - widget.offsetHeight - 8);
        drag = null;
        if (moved) {
            widget.classList.add("is-dragging");
            applyPosition(dock === "left" ? 0 : window.innerWidth - widget.offsetWidth, top, dock);
            widget.classList.remove("is-dragging");
            suppressClick = true;
            window.setTimeout(() => { suppressClick = false; }, 180);
        }
    }
    handle.addEventListener("pointerdown", event => startDrag(event, handle));
    if (heading) heading.addEventListener("pointerdown", event => startDrag(event, heading));
    window.addEventListener("pointermove", moveDrag, { passive: false });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    handle.addEventListener("click", event => {
        if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
    window.addEventListener("resize", () => {
        const rect = widget.getBoundingClientRect();
        const dock = widget.classList.contains("docked-left") ? "left" : "right";
        applyPosition(dock === "left" ? 0 : window.innerWidth - widget.offsetWidth, rect.top, dock);
    });
    restorePosition();
})();


/* =========================
   PIXEL LOCAL CLOCK
   Uses the visitor's device-local timezone.
========================= */
(() => {
    const clock = document.getElementById("pixelClock");
    const timeDisplay = document.getElementById("localClockTime");
    const dateDisplay = document.getElementById("localClockDate");
    const lightToggle = document.getElementById("clockLightToggle");
    if (!clock || !timeDisplay || !dateDisplay || !lightToggle) return;

    function updateLocalClock() {
        const now = new Date();
        timeDisplay.textContent = new Intl.DateTimeFormat(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(now);

        dateDisplay.textContent = new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(now);
    }

    lightToggle.addEventListener("click", () => {
        const isLit = lightToggle.getAttribute("aria-pressed") !== "true";
        lightToggle.setAttribute("aria-pressed", String(isLit));
        lightToggle.setAttribute("aria-label", isLit ? "Turn clock light off" : "Turn clock light on");
        lightToggle.classList.toggle("is-lit", isLit);
        clock.classList.toggle("is-unlit", !isLit);
    });

    // Drag the clock by its top bar; leave the light toggle clickable.
    const dragHandle = clock.querySelector(".pixel-clock-top");
    const positionKey = "iceFairyPixelClockPosition";
    let clockDrag = null;
    try {
        const saved = JSON.parse(localStorage.getItem(positionKey) || "null");
        if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
            const maxLeft = Math.max(0, window.innerWidth - clock.offsetWidth);
            const maxTop = Math.max(0, window.innerHeight - clock.offsetHeight);
            clock.style.left = Math.max(0, Math.min(maxLeft, saved.left)) + "px";
            clock.style.top = Math.max(0, Math.min(maxTop, saved.top)) + "px";
            clock.style.right = "auto";
        }
    } catch (_) {}

    dragHandle.style.cursor = "grab";
    dragHandle.style.touchAction = "none";
    dragHandle.addEventListener("pointerdown", event => {
        if (event.target.closest("button") || event.button !== 0) return;
        const rect = clock.getBoundingClientRect();
        clock.style.left = rect.left + "px";
        clock.style.top = rect.top + "px";
        clock.style.right = "auto";
        clockDrag = {
            id: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            left: rect.left,
            top: rect.top,
            moved: false
        };
        dragHandle.style.cursor = "grabbing";
        try { dragHandle.setPointerCapture(event.pointerId); } catch (_) {}
    });
    dragHandle.addEventListener("pointermove", event => {
        if (!clockDrag || event.pointerId !== clockDrag.id) return;
        const dx = event.clientX - clockDrag.startX;
        const dy = event.clientY - clockDrag.startY;
        if (!clockDrag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
        clockDrag.moved = true;
        event.preventDefault();
        const maxLeft = Math.max(0, window.innerWidth - clock.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - clock.offsetHeight);
        clock.style.left = Math.max(0, Math.min(maxLeft, clockDrag.left + dx)) + "px";
        clock.style.top = Math.max(0, Math.min(maxTop, clockDrag.top + dy)) + "px";
    });
    const endClockDrag = event => {
        if (!clockDrag || (event && event.pointerId !== undefined && event.pointerId !== clockDrag.id)) return;
        if (clockDrag.moved) {
            try {
                localStorage.setItem(positionKey, JSON.stringify({
                    left: parseFloat(clock.style.left) || 0,
                    top: parseFloat(clock.style.top) || 0
                }));
            } catch (_) {}
        }
        clockDrag = null;
        dragHandle.style.cursor = "grab";
    };
    dragHandle.addEventListener("pointerup", endClockDrag);
    dragHandle.addEventListener("pointercancel", endClockDrag);
    window.addEventListener("resize", () => {
        if (clock.hidden || getComputedStyle(clock).display === "none") return;
        const rect = clock.getBoundingClientRect();
        clock.style.left = Math.max(0, Math.min(window.innerWidth - rect.width, rect.left)) + "px";
        clock.style.top = Math.max(0, Math.min(window.innerHeight - rect.height, rect.top)) + "px";
        clock.style.right = "auto";
    });

    updateLocalClock();
    window.setInterval(updateLocalClock, 1000);
})();


/* =========================================================
   ICE FAIRY OS — desktop, window manager, start menu & settings
========================================================= */
(() => {
    const body = document.body;
    const boot = document.getElementById("osBoot");
    const bootSkip = document.getElementById("bootSkip");
    const desktop = document.getElementById("osDesktop");
    const homeWindow = document.getElementById("homeWindow");
    const settingsWindow = document.getElementById("settingsWindow");
    const homeBody = document.getElementById("homeWindowBody");
    const startButton = document.getElementById("osStartButton");
    const startMenu = document.getElementById("osStartMenu");
    const settingsTaskbar = document.getElementById("settingsTaskbar");
    const clock = document.getElementById("pixelClock");
    const particles = document.getElementById("particles");
    if (!desktop || !homeWindow || !homeBody) return;

    body.classList.add("os-mode", "os-booting");
    const originalContainer = document.querySelector("main.container");
    if (originalContainer) homeBody.appendChild(originalContainer);

    const windows = { home: homeWindow, settings: settingsWindow };
    let topZ = 25;
    const zUp = (win) => { if (win) win.style.zIndex = String(++topZ); };
    const setTaskbarActive = (id, active) => {
        const button = document.querySelector('[data-restore="' + id + '"]');
        if (button) button.classList.toggle("active", !!active);
    };
    function showWindow(id) {
        const win = windows[id];
        if (!win) return;
        win.hidden = false;
        win.classList.remove("is-minimized");
        zUp(win);
        setTaskbarActive(id, true);
        if (id === "settings" && settingsTaskbar) settingsTaskbar.hidden = false;
        closeStartMenu();
    }
    function hideWindow(id) {
        const win = windows[id];
        if (!win) return;
        win.hidden = true;
        setTaskbarActive(id, false);
        if (id === "settings" && settingsTaskbar) settingsTaskbar.hidden = true;
    }
    function minimizeWindow(id) {
        const win = windows[id];
        if (!win) return;
        win.classList.add("is-minimized");
        setTaskbarActive(id, false);
    }
    function closeStartMenu() {
        startMenu.hidden = true;
        startButton.setAttribute("aria-expanded", "false");
    }
    function openMusic() {
        const toggle = document.getElementById("musicToggle");
        if (toggle) {
            const menu = document.getElementById("menuMusicPanel");
            const awful = document.getElementById("awfulMusicPanel");
            if (menu && awful && menu.hidden && awful.hidden) toggle.click();
        }
        closeStartMenu();
    }
    document.querySelectorAll("[data-os-open]").forEach((button) => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-os-open");
            if (id === "music") openMusic();
            else showWindow(id);
        });
    });
    document.querySelectorAll("[data-close]").forEach(button => button.addEventListener("click", () => hideWindow(button.dataset.close)));
    document.querySelectorAll("[data-minimize]").forEach(button => button.addEventListener("click", () => minimizeWindow(button.dataset.minimize)));
    document.querySelectorAll("[data-maximize]").forEach(button => button.addEventListener("click", () => {
        const win = windows[button.dataset.maximize];
        if (!win) return;

        const taskbar = document.querySelector(".os-taskbar");
        const taskbarHeight = taskbar ? taskbar.getBoundingClientRect().height : 58;
        const margin = window.innerWidth <= 600 ? 8 : 14;
        const viewportW = document.documentElement.clientWidth || window.innerWidth;
        const viewportH = window.innerHeight;
        const maxHeight = Math.max(160, viewportH - taskbarHeight - margin * 2);

        // Disable the forwards-filled entrance animation: its transform can override restored geometry.
        win.style.setProperty("animation", "none", "important");
        win.style.setProperty("transform", "none", "important");

        if (!win.classList.contains("is-maximized")) {
            const rect = win.getBoundingClientRect();
            const width = Math.max(1, Math.min(rect.width || 720, viewportW - margin * 2));
            const height = Math.max(1, Math.min(rect.height || 480, maxHeight));
            const left = Math.max(margin, Math.min(viewportW - width - margin, rect.left));
            const top = Math.max(margin, Math.min(viewportH - taskbarHeight - height - margin, rect.top));
            win.dataset.restoreX = String(left);
            win.dataset.restoreY = String(top);
            win.dataset.restoreWidth = String(width);
            win.dataset.restoreHeight = String(height);

            win.classList.add("is-maximized");
            win.style.setProperty("position", "fixed", "important");
            win.style.setProperty("inset", margin + "px " + margin + "px calc(var(--os-bar-height) + " + margin + "px)", "important");
            win.style.setProperty("left", margin + "px", "important");
            win.style.setProperty("right", margin + "px", "important");
            win.style.setProperty("top", margin + "px", "important");
            win.style.setProperty("bottom", "calc(var(--os-bar-height) + " + margin + "px)", "important");
            win.style.setProperty("width", "auto", "important");
            win.style.setProperty("height", "auto", "important");
            win.style.setProperty("min-width", "0", "important");
            win.style.setProperty("min-height", "0", "important");
            win.style.setProperty("max-width", "none", "important");
            win.style.setProperty("max-height", "none", "important");
            win.style.setProperty("box-sizing", "border-box", "important");
        } else {
            win.classList.remove("is-maximized");
            ["inset","position","left","right","top","bottom","width","height","min-width","min-height","max-width","max-height","transform","box-sizing"].forEach(prop => win.style.removeProperty(prop));

            const width = Math.max(1, Math.min(Number(win.dataset.restoreWidth) || 720, viewportW - margin * 2));
            const height = Math.max(1, Math.min(Number(win.dataset.restoreHeight) || 480, maxHeight));
            const maxLeft = Math.max(margin, viewportW - width - margin);
            const maxTop = Math.max(margin, viewportH - taskbarHeight - height - margin);
            const left = Math.max(margin, Math.min(maxLeft, Number(win.dataset.restoreX) || margin));
            const top = Math.max(margin, Math.min(maxTop, Number(win.dataset.restoreY) || margin));

            win.style.setProperty("animation", "none", "important");
            win.style.setProperty("position", "fixed", "important");
            win.style.setProperty("left", left + "px", "important");
            win.style.setProperty("top", top + "px", "important");
            win.style.setProperty("right", "auto", "important");
            win.style.setProperty("bottom", "auto", "important");
            win.style.setProperty("width", width + "px", "important");
            win.style.setProperty("height", height + "px", "important");
            win.style.setProperty("min-width", "0", "important");
            win.style.setProperty("min-height", "0", "important");
            win.style.setProperty("max-width", "calc(100vw - " + margin * 2 + "px)", "important");
            win.style.setProperty("max-height", "calc(100dvh - var(--os-bar-height) - " + margin * 2 + "px)", "important");
            win.style.setProperty("transform", "none", "important");

            delete win.dataset.restoreX;
            delete win.dataset.restoreY;
            delete win.dataset.restoreWidth;
            delete win.dataset.restoreHeight;
        }
        zUp(win);
    }));
    document.querySelectorAll("[data-restore]").forEach(button => button.addEventListener("click", () => {
        const id = button.dataset.restore;
        const win = windows[id];
        if (win && !win.hidden && !win.classList.contains("is-minimized")) minimizeWindow(id);
        else showWindow(id);
    }));
    startButton.addEventListener("click", () => {
        const willOpen = startMenu.hidden;
        startMenu.hidden = !willOpen;
        startButton.setAttribute("aria-expanded", String(willOpen));
    });
    document.addEventListener("pointerdown", event => {
        if (!startMenu.hidden && !startMenu.contains(event.target) && !startButton.contains(event.target) && !event.target.closest("[data-os-open]")) closeStartMenu();
        const win = event.target.closest(".os-window");
        if (win) zUp(win);
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeStartMenu();
    });

    // Windows-style desktop icon dragging with locally remembered positions.
    (() => {
        const iconArea = document.querySelector(".desktop-icons");
        if (!iconArea) return;
        const icons = Array.from(iconArea.querySelectorAll(".desktop-icon"));
        const storageKey = "iceFairyOSDesktopIcons";
        let saved = {};
        try { saved = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (_) {}
        iconArea.style.position = "absolute";
        iconArea.style.display = "block";
        iconArea.style.height = "calc(100% - 150px)";
        icons.forEach((icon, index) => {
            icon.style.position = "absolute";
            icon.style.left = "0px";
            icon.style.top = (index * 94) + "px";
            icon.style.width = "88px";
            icon.style.touchAction = "none";
            const key = icon.dataset.desktopIconId || String(index);
            const savedPos = saved[key];
            if (savedPos && Number.isFinite(savedPos.x) && Number.isFinite(savedPos.y)) {
                icon.style.left = savedPos.x + "px";
                icon.style.top = savedPos.y + "px";
            }
            let drag = null;
            let suppressClick = false;
            icon.addEventListener("pointerdown", event => {
                if (event.button !== undefined && event.button !== 0) return;
                const rect = icon.getBoundingClientRect();
                drag = { id:event.pointerId, startX:event.clientX, startY:event.clientY, left:rect.left, top:rect.top, moved:false };
                try { icon.setPointerCapture(event.pointerId); } catch (_) {}
                icon.style.zIndex = "5";
            });
            icon.addEventListener("pointermove", event => {
                if (!drag || event.pointerId !== drag.id) return;
                const dx = event.clientX - drag.startX;
                const dy = event.clientY - drag.startY;
                if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
                if (!drag.moved) return;
                event.preventDefault();
                const areaRect = iconArea.getBoundingClientRect();
                const taskbarHeight = document.querySelector(".os-taskbar")?.getBoundingClientRect().height || 58;
                const maxX = Math.max(0, areaRect.width - icon.offsetWidth);
                const maxY = Math.max(0, window.innerHeight - taskbarHeight - areaRect.top - icon.offsetHeight);
                const x = Math.max(0, Math.min(maxX, drag.left + dx - areaRect.left));
                const y = Math.max(0, Math.min(maxY, drag.top + dy - areaRect.top));
                icon.style.left = x + "px";
                icon.style.top = y + "px";
            });
            const finish = () => {
                if (!drag) return;
                if (drag.moved) {
                    suppressClick = true;
                    saved[key] = { x:parseFloat(icon.style.left)||0, y:parseFloat(icon.style.top)||0 };
                    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch (_) {}
                    window.setTimeout(() => { suppressClick = false; }, 0);
                }
                drag = null;
                icon.style.zIndex = "";
            };
            icon.addEventListener("pointerup", finish);
            icon.addEventListener("pointercancel", finish);
            icon.addEventListener("lostpointercapture", finish);
            icon.addEventListener("click", event => {
                if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); }
            }, true);
        });
        const resetButton = document.getElementById("resetDesktopIcons");
        if (resetButton) resetButton.addEventListener("click", () => {
            saved = {};
            icons.forEach((icon, index) => {
                icon.style.left = "0px";
                icon.style.top = (index * 94) + "px";
                icon.style.zIndex = "";
            });
            try { localStorage.removeItem(storageKey); } catch (_) {}
        });

        window.addEventListener("resize", () => {
            const areaRect = iconArea.getBoundingClientRect();
            const taskbarHeight = document.querySelector(".os-taskbar")?.getBoundingClientRect().height || 58;
            icons.forEach((icon, index) => {
                const x = Math.max(0, Math.min(Math.max(0, areaRect.width-icon.offsetWidth), parseFloat(icon.style.left)||0));
                const maxY = Math.max(0, window.innerHeight-taskbarHeight-areaRect.top-icon.offsetHeight);
                const y = Math.max(0, Math.min(maxY, parseFloat(icon.style.top)||index*94));
                icon.style.left = x+"px";
                icon.style.top = y+"px";
                saved[icon.dataset.desktopIconId || String(index)] = {x,y};
            });
            try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch (_) {}
        });
    })();

    // Keep every draggable window inside the usable desktop area.
    function usableBounds(win) {
        const taskbar = document.querySelector(".os-taskbar");
        const taskbarHeight = taskbar ? taskbar.getBoundingClientRect().height : 58;
        const maxWidth = Math.max(180, window.innerWidth - 16);
        const maxHeight = Math.max(140, window.innerHeight - taskbarHeight - 16);
        const width = Math.min(win.getBoundingClientRect().width, maxWidth);
        const height = Math.min(win.getBoundingClientRect().height, maxHeight);
        return { taskbarHeight, maxLeft: Math.max(0, window.innerWidth - width), maxTop: Math.max(0, window.innerHeight - taskbarHeight - height), width, height };
    }
    function keepWindowInBounds(win) {
        if (!win || win.hidden || win.classList.contains("is-maximized")) return;
        const bounds = usableBounds(win);
        if (win.style.left && win.style.transform === "none") {
            win.style.width = bounds.width + "px";
            win.style.height = bounds.height + "px";
            win.style.left = Math.max(0, Math.min(bounds.maxLeft, parseFloat(win.style.left) || 0)) + "px";
            win.style.top = Math.max(0, Math.min(bounds.maxTop, parseFloat(win.style.top) || 0)) + "px";
        }
    }
    document.querySelectorAll("[data-drag-window]").forEach(bar => {
        const id = bar.dataset.dragWindow;
        const win = windows[id];
        if (!win) return;
        let drag = null;
        bar.addEventListener("pointerdown", event => {
            if (event.target.closest("button") || win.classList.contains("is-maximized")) return;
            if (event.button !== undefined && event.button !== 0) return;
            const rect = win.getBoundingClientRect();
            drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top, width: rect.width, height: rect.height, moved: false };
            try { bar.setPointerCapture(event.pointerId); } catch (_) {}
            zUp(win);
        });
        bar.addEventListener("pointermove", event => {
            if (!drag || (drag.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
            if (!drag.moved) return;
            event.preventDefault();
            const bounds = usableBounds(win);
            win.style.position = "fixed";
            win.style.width = Math.min(drag.width, window.innerWidth - 16) + "px";
            win.style.height = Math.min(drag.height, window.innerHeight - bounds.taskbarHeight - 16) + "px";
            win.style.transform = "none";
            win.style.right = "auto";
            win.style.bottom = "auto";
            const actualWidth = win.getBoundingClientRect().width;
            const actualHeight = win.getBoundingClientRect().height;
            const maxLeft = Math.max(0, window.innerWidth - actualWidth);
            const maxTop = Math.max(0, window.innerHeight - bounds.taskbarHeight - actualHeight);
            win.style.left = Math.max(0, Math.min(maxLeft, drag.left + dx)) + "px";
            win.style.top = Math.max(0, Math.min(maxTop, drag.top + dy)) + "px";
        });
        const endDrag = () => { drag = null; };
        bar.addEventListener("pointerup", endDrag);
        bar.addEventListener("pointercancel", endDrag);
        bar.addEventListener("lostpointercapture", endDrag);
    });

    // Persist personalization locally, without changing any audio/player logic.
    const settingMap = [
        ["settingSnow", "snow", enabled => body.classList.toggle("os-snow-off", !enabled)],
        ["settingGlass", "glass", enabled => body.classList.toggle("os-glass-off", !enabled)],
        ["settingClock", "clock", enabled => { if (clock) clock.style.display = enabled ? "" : "none"; }]
    ];
    let savedSettings = {};
    try { savedSettings = JSON.parse(localStorage.getItem("iceFairyOSSettings") || "{}"); } catch (_) {}
    settingMap.forEach(([id, key, apply]) => {
        const control = document.getElementById(id);
        if (!control) return;
        if (typeof savedSettings[key] === "boolean") control.checked = savedSettings[key];
        apply(control.checked);
        control.addEventListener("change", () => {
            apply(control.checked);
            savedSettings[key] = control.checked;
            try { localStorage.setItem("iceFairyOSSettings", JSON.stringify(savedSettings)); } catch (_) {}
        });
    });
    const doneButton = document.getElementById("settingsDone");
    if (doneButton) doneButton.addEventListener("click", () => hideWindow("settings"));

    function updateTaskbarClock() {
        const now = new Date();
        const time = document.getElementById("taskbarTime");
        const date = document.getElementById("taskbarDate");
        if (time) time.textContent = new Intl.DateTimeFormat(undefined, {hour:"2-digit", minute:"2-digit", hour12:false}).format(now);
        if (date) date.textContent = new Intl.DateTimeFormat(undefined, {month:"short", day:"2-digit"}).format(now);
    }
    updateTaskbarClock();
    window.setInterval(updateTaskbarClock, 1000);

    // Remove the old optional cache worker; it is not needed for this site.
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => registration.unregister());
        }).catch(() => {});
    }

    function finishBoot() {
        if (!boot || boot.classList.contains("is-done")) return;
        const status = document.getElementById("bootStatus");
        if (status) status.textContent = "Welcome to Gensokyo.";
        boot.classList.add("is-done");
        body.classList.remove("os-booting");
        window.setTimeout(() => { if (boot.parentNode) boot.remove(); }, 800);
    }
    if (bootSkip) bootSkip.addEventListener("click", finishBoot);
    window.setTimeout(finishBoot, 900);
    window.addEventListener("resize", () => {
        document.querySelectorAll(".os-window:not(.is-maximized)").forEach(keepWindowInBounds);
    });
})();
