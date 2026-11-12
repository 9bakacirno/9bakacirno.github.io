
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
   DUAL MUSIC PLAYERS
========================= */

const musicToggle = document.getElementById("musicToggle");
const musicPanel = document.getElementById("musicPanel");
const musicClose = document.getElementById("musicClose");

function setMusicPanelOpen(open) {
    if (!musicPanel || !musicToggle) return;
    musicPanel.hidden = !open;
    musicToggle.setAttribute("aria-expanded", String(open));
    musicToggle.setAttribute("aria-label", open ? "Close music players" : "Open music players");
    musicToggle.classList.toggle("is-open", open);
}

if (musicToggle && musicPanel) {
    musicToggle.addEventListener("click", () => setMusicPanelOpen(musicPanel.hidden));
}
if (musicClose) {
    musicClose.addEventListener("click", () => setMusicPanelOpen(false));
}
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && musicPanel && !musicPanel.hidden) {
        setMusicPanelOpen(false);
    }
});

function formatMusicTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function setupMusicPlayer(config) {
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
            if (progress) progress.value = (audio.currentTime / total) * 100;
            if (currentTime) currentTime.textContent = formatMusicTime(audio.currentTime);
            if (duration) duration.textContent = formatMusicTime(total);
        } else {
            if (progress) progress.value = 0;
            if (currentTime) currentTime.textContent = formatMusicTime(0);
            if (duration) duration.textContent = "0:00";
        }
    }

    button.addEventListener("click", async () => {
        // Avoid both players playing over each other.
        document.querySelectorAll(".independent-audio").forEach((other) => {
            if (other !== audio) other.pause();
        });
        if (audio.paused) {
            try {
                await audio.play();
            } catch (error) {
                if (status) status.textContent = "Playback blocked or audio file unavailable — click Play again.";
            }
        } else {
            audio.pause();
        }
        updateButton();
    });

    audio.addEventListener("play", () => {
        document.querySelectorAll(".independent-audio").forEach((other) => {
            if (other !== audio) other.pause();
        });
        updateButton();
        if (status) status.textContent = config.playingText;
    });
    audio.addEventListener("pause", updateButton);
    audio.addEventListener("ended", updateButton);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("durationchange", updateProgress);

    if (progress) {
        progress.addEventListener("input", () => {
            if (Number.isFinite(audio.duration) && audio.duration > 0) {
                audio.currentTime = (Number(progress.value) / 100) * audio.duration;
                updateProgress();
            }
        });
    }

    audio.classList.add("independent-audio");
    return { audio, updateButton, updateProgress };
}

const menuPlayer = setupMusicPlayer({
    audioId: "menuAudio",
    buttonId: "menuPlayButton",
    progressId: "menuProgressBar",
    currentTimeId: "menuCurrentTime",
    durationId: "menuDuration",
    statusId: "menuStatus",
    playingText: "♪ Playing Menu OST"
});

const libraryAudio = document.getElementById("libraryAudio");
const libraryTrack = document.getElementById("libraryTrack");
const libraryStatus = document.getElementById("libraryStatus");

const libraryPlayer = setupMusicPlayer({
    audioId: "libraryAudio",
    buttonId: "libraryPlayButton",
    progressId: "libraryProgressBar",
    currentTimeId: "libraryCurrentTime",
    durationId: "libraryDuration",
    statusId: "libraryStatus",
    playingText: "♪ Playing selected track"
});

// Future songs can be added as <option value="filename.mp3">Song — Artist</option>
// in index.html. Changing the selection updates only the Other Music player.
if (libraryTrack && libraryAudio) {
    libraryTrack.addEventListener("change", () => {
        const wasPlaying = !libraryAudio.paused;
        libraryAudio.pause();
        libraryAudio.src = libraryTrack.value;
        libraryAudio.load();
        const selectedLabel = libraryTrack.options[libraryTrack.selectedIndex]?.text || "Selected track";
        if (libraryStatus) libraryStatus.textContent = selectedLabel + " · Ready";
        const currentTime = document.getElementById("libraryCurrentTime");
        const duration = document.getElementById("libraryDuration");
        const progress = document.getElementById("libraryProgressBar");
        if (currentTime) currentTime.textContent = "0:00";
        if (duration) duration.textContent = "0:00";
        if (progress) progress.value = 0;
        if (wasPlaying) {
            libraryAudio.play().catch(() => {
                if (libraryStatus) libraryStatus.textContent = "Click Play to start this track.";
            });
        }
    });
}

// Attempt autoplay for the dedicated Menu player. Browsers may block audible autoplay.
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
   DRAG / EDGE DOCK MUSIC WIDGET
========================= */
(() => {
    const widget = document.querySelector(".music-widget");
    const handle = document.getElementById("musicToggle");
    const heading = document.querySelector(".music-widget-heading");
    if (!widget || !handle) return;

    const STORAGE_KEY = "cirnoMusicWidgetPosition";
    let drag = null;
    let suppressClick = false;

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function applyPosition(left, top, dock = null) {
        const maxLeft = Math.max(0, window.innerWidth - widget.offsetWidth);
        const maxTop = Math.max(8, window.innerHeight - widget.offsetHeight - 8);
        left = clamp(left, 0, maxLeft);
        top = clamp(top, 8, maxTop);
        // Animate a single numeric left position; transitioning between
        // left/right and auto cannot interpolate smoothly in CSS.
        const dockLeft = dock === "left" ? -22 : dock === "right" ? window.innerWidth - widget.offsetWidth + 22 : left;
        widget.style.left = clamp(dockLeft, dock ? -22 : 0, dock ? window.innerWidth - widget.offsetWidth + 22 : maxLeft) + "px";
        widget.style.right = "auto";
        widget.style.top = top + "px";
        widget.style.transform = "none";
        widget.classList.toggle("docked-left", dock === "left");
        widget.classList.toggle("docked-right", dock === "right");
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                left: dock === "left" ? 0 : maxLeft,
                top,
                dock: dock || "right"
            }));
        } catch (_) {}
    }

    function restorePosition() {
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) {}
        if (saved && Number.isFinite(saved.top)) {
            applyPosition(saved.left || 0, saved.top, saved.dock === "left" ? "left" : "right");
        } else {
            applyPosition(window.innerWidth - widget.offsetWidth, window.innerHeight / 2 - widget.offsetHeight / 2, "right");
        }
    }

    function startDrag(event, source) {
        if (event.button !== undefined && event.button !== 0) return;
        if (event.target.closest("button") && source === heading && event.target !== heading) return;
        const rect = widget.getBoundingClientRect();
        drag = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            left: rect.left,
            top: rect.top,
            moved: false
        };
        widget.classList.add("is-dragging");
        if (source.setPointerCapture && event.pointerId !== undefined) {
            try { source.setPointerCapture(event.pointerId); } catch (_) {}
        }
        event.preventDefault();
    }

    function moveDrag(event) {
        if (!drag || (drag.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
        if (!drag.moved) return;
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
        widget.classList.remove("is-dragging");
        if (moved) {
            applyPosition(dock === "left" ? 0 : window.innerWidth - widget.offsetWidth, top, dock);
            suppressClick = true;
            window.setTimeout(() => { suppressClick = false; }, 180);
        }
    }

    handle.addEventListener("pointerdown", event => startDrag(event, handle));
    if (heading) heading.addEventListener("pointerdown", event => {
        if (event.target.closest("button")) return;
        startDrag(event, heading);
    });
    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    handle.addEventListener("click", event => {
        if (suppressClick) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
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

    updateLocalClock();
    window.setInterval(updateLocalClock, 1000);
})();
