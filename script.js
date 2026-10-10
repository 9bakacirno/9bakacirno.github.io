
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
   MUSIC PLAYER
========================= */

const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");
const musicStatus = document.getElementById("music-status");

const normalButton = document.getElementById("normalButton");
const slowedButton = document.getElementById("slowedButton");

const progressBar = document.getElementById("progressBar");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");

let playing = false;
let musicVersion = "normal";

const musicSources = {
    normal: "awful.mp3",
    slowed: "awful-slowed.mp3"
};

/* =========================
   SYNCHRONIZED LYRICS
========================= */

const lyricsDisplay = document.getElementById("lyricsDisplay");

let lyricLines = [];
let lyricElements = [];
let activeLyricIndex = -1;

// Normal song duration: 2:16 = 136 seconds.
// Used as a fallback until the browser loads the actual duration.
let normalDuration = 136;

function parseLRC(text) {
    const lines = [];

    for (const line of text.split(/\r?\n/)) {
        const timestamps = [
             ...line.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)
         ];

        if (timestamps.length === 0) continue;

        const lyric = line
          .replace(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g, "")
          .trim();

        for (const match of timestamps) {
            const minutes = Number(match[1]);
            const seconds = Number(match[2]);
            const fraction = (match[3] || "0").padEnd(3, "0");

            const time =
                minutes * 60 +
                seconds +
                Number(fraction) / 1000;

            lines.push({ time, text: lyric });
        }
    }

    return lines.sort((a, b) => a.time - b.time);
}

function renderLyrics() {
    if (!lyricsDisplay) return;

    lyricsDisplay.replaceChildren();
    lyricElements = [];
    activeLyricIndex = -1;

    if (lyricLines.length === 0) {
        const message = document.createElement("p");
        message.className = "lyric-line";
        message.textContent = "No lyrics found.";
        lyricsDisplay.appendChild(message);
        return;
    }

    for (const line of lyricLines) {
        const element = document.createElement("p");
        element.className = "lyric-line";
        element.textContent = line.text || "♪";
        lyricsDisplay.appendChild(element);
        lyricElements.push(element);
    }

    updateLyrics();
}

async function loadLyrics() {
    if (!lyricsDisplay) return;

    try {
        const response = await fetch("awful.lrc");

        if (!response.ok) {
            throw new Error("Could not load awful.lrc");
        }

        const text = await response.text();
        lyricLines = parseLRC(text);
        renderLyrics();
    } catch (error) {
    lyricsDisplay.textContent =
        "Lyrics error: " + error.message;
    console.error("Lyrics loading failed:", error);
   }
}

function updateLyrics() {
    if (!music || lyricLines.length === 0) return;

    if (
        musicVersion === "normal" &&
        Number.isFinite(music.duration) &&
        music.duration > 0
    ) {
        normalDuration = music.duration;
    }

    const currentDuration = music.duration;
    let lyricTime = music.currentTime;

    if (
        musicVersion === "slowed" &&
        Number.isFinite(currentDuration) &&
        currentDuration > 0 &&
        normalDuration > 0
    ) {
        lyricTime =
            music.currentTime * normalDuration / currentDuration;
    }

    let nextIndex = -1;

    for (let i = 0; i < lyricLines.length; i++) {
        if (lyricLines[i].time <= lyricTime) {
            nextIndex = i;
        } else {
            break;
        }
    }

    // Remove all old highlights first
    lyricElements.forEach((element) => {
        element.classList.remove("active");
    });

    activeLyricIndex = nextIndex;

    // Highlight only the current lyric
    if (activeLyricIndex >= 0 && lyricElements[activeLyricIndex]) {
        const activeElement = lyricElements[activeLyricIndex];

        activeElement.classList.add("active");
        activeElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }
}
loadLyrics();

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function updateProgress() {
    if (!music || !progressBar) return;

    const duration = music.duration;

    if (Number.isFinite(duration) && duration > 0) {
        progressBar.value = (music.currentTime / duration) * 100;

        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = formatTime(music.currentTime);
        }

        if (durationDisplay) {
            durationDisplay.textContent = formatTime(duration);
        }
    } else {
        progressBar.value = 0;

        if (currentTimeDisplay) currentTimeDisplay.textContent = "0:00";
        if (durationDisplay) durationDisplay.textContent = "0:00";
    }
}

function updatePlayButton() {
    playing = !music.paused;
    musicButton.textContent = playing ? "⏸ Pause" : "▶ Play";
}

function updateVersionButtons() {
    if (normalButton) {
        normalButton.classList.toggle("active", musicVersion === "normal");
    }

    if (slowedButton) {
        slowedButton.classList.toggle("active", musicVersion === "slowed");
    }
}

// Play / pause
if (music && musicButton) {
    musicButton.addEventListener("click", async () => {
        if (music.paused) {
            try {
                await music.play();
            } catch (error) {
                if (musicStatus) {
                    musicStatus.textContent =
                        "Couldn't play music — check the audio file names.";
                }
            }
        } else {
            music.pause();
        }
    });

    music.addEventListener("play", () => {
        updatePlayButton();

        if (musicStatus) {
            musicStatus.textContent =
                musicVersion === "normal"
                    ? "♪ Now playing — Normal"
                    : "♪ Now playing — Slowed";
        }
    });

    music.addEventListener("pause", updatePlayButton);

    music.addEventListener("ended", () => {
        updatePlayButton();
    });

    music.addEventListener("timeupdate", () => {
    updateProgress();
    updateLyrics();
});

music.addEventListener("loadedmetadata", () => {
    if (
        musicVersion === "normal" &&
        Number.isFinite(music.duration) &&
        music.duration > 0
    ) {
        normalDuration = music.duration;
    }

    updateProgress();
    updateLyrics();
});

music.addEventListener("durationchange", () => {
    updateProgress();
    updateLyrics();
});
}

// Seek by dragging the progress bar
if (music && progressBar) {
    progressBar.addEventListener("input", () => {
        if (Number.isFinite(music.duration) && music.duration > 0) {
            music.currentTime =
                (Number(progressBar.value) / 100) * music.duration;

            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = formatTime(music.currentTime);
            }
        }
    });
}

// Switch between Normal and Slowed
async function switchMusicVersion(version) {
    if (!music || version === musicVersion) return;

    const wasPlaying = !music.paused;
    musicVersion = version;

    music.pause();
    music.src = musicSources[version];
    music.load();
   activeLyricIndex = -1;
   updateLyrics();

    if (progressBar) progressBar.value = 0;
    if (currentTimeDisplay) currentTimeDisplay.textContent = "0:00";
    if (durationDisplay) durationDisplay.textContent = "0:00";

    updateVersionButtons();

    if (musicStatus) {
        musicStatus.textContent =
            version === "normal"
                ? "AWFUL — Normal version"
                : "AWFUL — Slowed version";
    }

    if (wasPlaying) {
        try {
            await music.play();
        } catch (error) {
            if (musicStatus) {
                musicStatus.textContent =
                    "Couldn't play music — check the audio file names.";
            }
        }
    }
}

if (normalButton) {
    normalButton.addEventListener("click", () => {
        switchMusicVersion("normal");
    });
}

if (slowedButton) {
    slowedButton.addEventListener("click", () => {
        switchMusicVersion("slowed");
    });
}

updateVersionButtons();


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
