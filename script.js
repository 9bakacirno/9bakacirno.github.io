/* =====================================
   9BAKACIRNO PERSONAL PAGE
   Cirno × Remilia
===================================== */


/* =========================
   SNOW / ICE PARTICLES
========================= */

const particleContainer =
    document.getElementById("particles");

const particleSymbols = [
    "❄",
    "✦",
    "✧",
    "·"
];

function createParticle() {

    const particle =
        document.createElement("div");

    particle.className =
        "particle";

    particle.textContent =
        particleSymbols[
            Math.floor(
                Math.random() *
                particleSymbols.length
            )
        ];

    particle.style.left =
        Math.random() * 100 + "vw";

    particle.style.fontSize =
        (Math.random() * 14 + 8) + "px";

    particle.style.animationDuration =
        (Math.random() * 8 + 7) + "s";

    particle.style.animationDelay =
        Math.random() * 5 + "s";

    particleContainer.appendChild(
        particle
    );

    setTimeout(() => {

        particle.remove();

    }, 16000);
}


setInterval(
    createParticle,
    350
);


/* =========================
   MUSIC PLAYER
========================= */

const music =
    document.getElementById("music");

const musicButton =
    document.getElementById("musicButton");

const musicStatus =
    document.getElementById("music-status");


let playing = false;


musicButton.addEventListener(
    "click",
    () => {

        if (!playing) {

            music.play()
                .then(() => {

                    playing = true;

                    musicButton.textContent =
                        "⏸ Pause";

                    musicStatus.textContent =
                        "♪ Now playing...";

                })
                .catch(() => {

                    musicStatus.textContent =
                        "Put your music.mp3 in the same folder first!";

                });

        } else {

            music.pause();

            playing = false;

            musicButton.textContent =
                "▶ Play";

            musicStatus.textContent =
                "Music paused";

        }

    }
);


/* =========================
   BAKA BUTTON
========================= */

const bakaButton =
    document.getElementById("bakaButton");

const bakaText =
    document.getElementById("bakaText");


let clickCount = 0;


bakaButton.addEventListener(
    "click",
    () => {

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

            bakaText.textContent =
                messages[clickCount - 1];

        } else {

            bakaText.textContent =
                "⑨⑨⑨⑨⑨⑨⑨";

        }

    }
);


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


document.addEventListener(
    "keydown",
    (event) => {

        secretInput.push(
            event.key
        );

        if (
            secretInput.length >
            secretCode.length
        ) {

            secretInput.shift();

        }

        const match =
            secretCode.every(
                (key, index) =>
                    secretInput[index] === key
            );

        if (match) {

            document.body.style.transform =
                "rotate(0.5deg)";

            setTimeout(() => {

                document.body.style.transform =
                    "rotate(-0.5deg)";

            }, 100);

            setTimeout(() => {

                document.body.style.transform =
                    "rotate(0deg)";

            }, 200);

            bakaText.textContent =
                "❄️ SECRET ICE MAGIC UNLOCKED ❄️";

            secretInput = [];

        }

    }
);


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

    if (
        titleIndex >= titles.length
    ) {

        titleIndex = 0;

    }

    document.title =
        titles[titleIndex];

}, 5000);
