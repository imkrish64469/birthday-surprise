// ===============================
// GLOBAL VARIABLES
// ===============================

let audioContext = null;
let analyser = null;
let microphone = null;

let blowDetected = false;
let blowTimer = null;

let currentMemory = 0;
let slideshowTimer = null;

let musicStarted = false;

let heartInterval = null;


// ===============================
// OPEN SURPRISE
// ===============================

function openSurprise() {

    const welcome = document.getElementById("welcomeScreen");
    const cake = document.getElementById("cakeScreen");

    if (welcome) {
        welcome.style.display = "none";
    }

    if (cake) {
        cake.style.display = "flex";
    }
}


// ===============================
// START MICROPHONE
// ===============================

async function startListening() {

    console.log("🎤 Starting microphone...");

    blowDetected = false;

    const blowButton = document.getElementById("blowButton");

    if (blowButton) {
        blowButton.disabled = true;
        blowButton.innerHTML = "🎤 Listening...";
    }

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        audioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();

        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        analyser = audioContext.createAnalyser();

        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.2;

        microphone =
            audioContext.createMediaStreamSource(stream);

        microphone.connect(analyser);

        console.log("🎤 Microphone connected!");

        if (blowButton) {
            blowButton.innerHTML = "💨 Blow Now!";
        }

        detectBlow();

    } catch (error) {

        console.error("Microphone error:", error);

        if (blowButton) {
            blowButton.disabled = false;
            blowButton.innerHTML = "🕯️ Blow Candles";
        }

        alert(
            "Microphone permission allow karo 🎤\n\n" +
            "Browser ke address bar ke paas microphone icon par click karke Allow karo."
        );
    }
}


// ===============================
// DETECT BLOW
// ===============================

function detectBlow() {

    if (!analyser || blowDetected) {
        return;
    }

    const data =
        new Uint8Array(analyser.fftSize);

    analyser.getByteTimeDomainData(data);

    let sum = 0;

    for (let i = 0; i < data.length; i++) {

        const value =
            (data[i] - 128) / 128;

        sum += value * value;
    }

    const rms =
        Math.sqrt(sum / data.length);

    console.log(
        "Mic level:",
        rms.toFixed(3)
    );

    if (rms > 0.045) {

        if (!blowTimer) {

            blowTimer = setTimeout(() => {

                if (!blowDetected) {

                    blowDetected = true;

                    blowCandles();
                }

                blowTimer = null;

            }, 120);
        }

    } else {

        if (blowTimer) {

            clearTimeout(blowTimer);

            blowTimer = null;
        }
    }

    requestAnimationFrame(detectBlow);
}


// ===============================
// BLOW CANDLES
// ===============================

function blowCandles() {

    console.log("🔥 CANDLES BLOWN!");

    // Stop microphone
    if (microphone) {

        try {
            microphone.disconnect();
        } catch (e) {}

        microphone = null;
    }

    // Close audio context
    if (audioContext) {

        try {
            audioContext.close();
        } catch (e) {}

        audioContext = null;
    }

    // Remove candle flames
    document
        .querySelectorAll(".flame")
        .forEach(flame => {

            flame.style.opacity = "0";

            flame.style.transform =
                "scale(0)";

            setTimeout(() => {

                flame.style.display = "none";

            }, 300);
        });

    // Change text
    const blowText =
        document.getElementById("blowText");

    if (blowText) {

        blowText.innerHTML =
            "✨ Wish Made! ✨";
    }

    // Hide blow button
    const blowButton =
        document.getElementById("blowButton");

    if (blowButton) {

        blowButton.style.display =
            "none";
    }

    // Start birthday music
    startMusic();

    // Celebration
    setTimeout(() => {

        const cake =
            document.getElementById("cakeScreen");

        const celebration =
            document.getElementById("celebration");

        if (cake) {
            cake.style.display = "none";
        }

        if (celebration) {

            celebration.style.display =
                "flex";

            // Confetti
            startConfetti();

            // ❤️ Falling Hearts
            startFloatingHearts();
        }

    }, 800);

    // Show memories
    setTimeout(() => {

        showMemories();

    }, 5500);
}


// ===============================
// CONFETTI
// ===============================

function startConfetti() {

    const container =
        document.getElementById(
            "confetti-container"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    for (let i = 0; i < 180; i++) {

        const piece =
            document.createElement("div");

        piece.className = "confetti";

        piece.style.left =
            Math.random() * 100 + "%";

        piece.style.animationDelay =
            Math.random() * 3 + "s";

        piece.style.animationDuration =
            3 + Math.random() * 4 + "s";

        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;

        container.appendChild(piece);
    }
}


// ===============================
// ❤️ FALLING / FLOATING HEARTS
// ===============================

function startFloatingHearts() {

    const symbols = [
        "❤️",
        "💕",
        "💖",
        "💗",
        "💓",
        "💞",
        "🌸",
        "✨"
    ];

    if (heartInterval) {

        clearInterval(heartInterval);
    }

    heartInterval = setInterval(() => {

        const heart =
            document.createElement("div");

        heart.innerText =
            symbols[
                Math.floor(
                    Math.random() *
                    symbols.length
                )
            ];

        heart.style.position = "fixed";

        heart.style.left =
            Math.random() * 100 + "vw";

        heart.style.bottom =
            "-40px";

        heart.style.fontSize =
            (18 + Math.random() * 25) + "px";

        heart.style.zIndex =
            "10000";

        heart.style.pointerEvents =
            "none";

        document.body.appendChild(heart);

        const drift =
            (Math.random() - 0.5) * 180;

        const animation =
            heart.animate(
                [
                    {
                        transform:
                            "translate(0, 0) scale(.5)",

                        opacity: 0
                    },

                    {
                        transform:
                            `translate(${drift / 2}px, -50vh) scale(1)`,

                        opacity: 1
                    },

                    {
                        transform:
                            `translate(${drift}px, -110vh) scale(.8)`,

                        opacity: 0
                    }
                ],

                {
                    duration:
                        5000 +
                        Math.random() * 3000,

                    easing: "ease-out"
                }
            );

        animation.onfinish = () => {

            heart.remove();
        };

    }, 400);
}


// ===============================
// MEMORIES DATA
// ===============================

const memories = [

    {
        image: "memories1.jpeg",

        title: "The Beginning ❤️",

        text:
            "Har beautiful story ki ek beginning hoti hai... " +
            "aur meri story ki sabse beautiful beginning aap ho."
    },

    {
        image: "memories2.jpeg",

        title: "Meri Favourite Person 🥰",

        text:
            "Duniya mein bahut log mile, lekin mere liye " +
            "sabse special person hamesha aap hi rahogi."
    },

    {
        image: "memories3.jpeg",

        title: "Beautiful Times ✨",

        text:
            "Ye moments shayad simple the, lekin aapke saath " +
            "hone ki wajah se mere liye priceless ban gaye."
    },

    {
        image: "memories4.jpg",

        title: "Aapki Smile 😊",

        text:
            "Aapki smile dekh kar pata nahi kyun meri saari " +
            "tension automatically disappear ho jaati hai."
    },

    {
        image: "memories5.jpg",

        title: "Always Together 🫶",

        text:
            "Life chahe kitni bhi busy ho jaaye, dil mein " +
            "aapke saath bitaye moments hamesha rahenge."
    },

    {
        image: "memories6.jpeg",

        title: "A Moment To Remember 🌸",

        text:
            "Kuch moments photographs mein capture hote hain, " +
            "aur kuch directly dil mein."
    },

    {
        image: "memories7.jpeg",

        title: "Aapke Liye 😊",

        text:
            "Aaj ka ye chhota sa surprise us pyaar ka ek " +
            "tiny sa return gift hai jo aapne mujhe hamesha diya."
    },

    {
        image: "memories8.jpeg",

        title: "Precious Memories 💕",

        text:
            "Ye memories mere liye kisi treasure se kam nahi hain."
    },

    {
        image: "memories9.jpeg",

        title: "Always Special ❤️",

        text:
            "Time change ho sakta hai, situations change ho sakti hain, " +
            "but aap mere liye hamesha special rahogi."
    },

    {
        image: "memories10.jpeg",

        title: "That Beautiful Smile 😊",

        text:
            "Aapko smile karte dekhna mere favourite moments mein se ek hai."
    },

    {
        image: "memories11.jpeg",

        title: "Forever In My Heart 🥹",

        text:
            "Chahe main life mein kahin bhi pahunch jaun, " +
            "aapki jagah mere heart mein hamesha same rahegi."
    },

    {
        image: "memories12.jpeg",

        title: "My Everything ❤️",

        text:
            "Aur finally... ek simple si baat — I love you, Mommy. " +
            "More than words can ever explain."
    }
];


// ===============================
// DISPLAY MEMORY
// ===============================

function displayMemory() {

    const memory =
        memories[currentMemory];

    const image =
        document.getElementById(
            "memoryImage"
        );

    const number =
        document.getElementById(
            "memoryNumber"
        );

    const title =
        document.getElementById(
            "memoryTitle"
        );

    const text =
        document.getElementById(
            "memoryText"
        );

    const progress =
        document.getElementById(
            "memoryProgress"
        );

    if (!memory) {
        return;
    }

    // Smooth image transition
    if (image) {

        image.style.opacity = "0";

        image.classList.remove(
            "emotional-zoom"
        );

        setTimeout(() => {

            image.src =
                memory.image;

            image.style.transform =
                "scale(1)";

            image.style.opacity =
                "1";

            requestAnimationFrame(() => {

                image.classList.add(
                    "emotional-zoom"
                );
            });

        }, 900);
    }

    if (number) {

        number.innerText =
            `Memory ${currentMemory + 1} / ${memories.length}`;
    }

    if (title) {

        title.innerText =
            memory.title;
    }

    if (text) {

        text.innerText =
            memory.text;
    }

    if (progress) {

        progress.style.width =
            `${((currentMemory + 1) / memories.length) * 100}%`;
    }

    const nextButton =
        document.getElementById(
            "nextMemory"
        );

    if (nextButton) {

        if (
            currentMemory ===
            memories.length - 1
        ) {

            nextButton.innerHTML =
                "❤️ Continue";

        } else {

            nextButton.innerHTML =
                "Next Memory ❤️";
        }
    }
}


// ===============================
// SHOW MEMORIES
// ===============================

function showMemories() {

    const celebration =
        document.getElementById(
            "celebration"
        );

    const memoriesScreen =
        document.getElementById(
            "memories"
        );

    if (celebration) {

        celebration.style.display =
            "none";
    }

    if (memoriesScreen) {

        memoriesScreen.style.display =
            "flex";
    }

    currentMemory = 0;

    displayMemory();

    if (slideshowTimer) {

        clearInterval(
            slideshowTimer
        );
    }

    // 8 seconds per memory
    slideshowTimer =
        setInterval(() => {

            if (
                currentMemory <
                memories.length - 1
            ) {

                currentMemory++;

                displayMemory();

            } else {

                clearInterval(
                    slideshowTimer
                );

                slideshowTimer = null;

                setTimeout(() => {

                    showFinalMessage();

                }, 5000);
            }

        }, 8000);
}


// ===============================
// NEXT MEMORY
// ===============================

function nextMemory() {

    if (slideshowTimer) {

        clearInterval(
            slideshowTimer
        );
    }

    if (
        currentMemory <
        memories.length - 1
    ) {

        currentMemory++;

        displayMemory();

        slideshowTimer =
            setInterval(() => {

                if (
                    currentMemory <
                    memories.length - 1
                ) {

                    currentMemory++;

                    displayMemory();

                } else {

                    clearInterval(
                        slideshowTimer
                    );

                    slideshowTimer = null;

                    setTimeout(() => {

                        showFinalMessage();

                    }, 5000);
                }

            }, 8000);

    } else {

        showFinalMessage();
    }
}


// ===============================
// FINAL MESSAGE
// ===============================

function showFinalMessage() {

    const memoriesScreen =
        document.getElementById(
            "memories"
        );

    const finalScreen =
        document.getElementById(
            "finalMessage"
        );

    if (memoriesScreen) {

        memoriesScreen.style.display =
            "none";
    }

    if (finalScreen) {

        finalScreen.style.display =
            "flex";
    }
}


// ===============================
// RELIVE MEMORIES
// ===============================

function reliveMemories() {

    const finalScreen =
        document.getElementById(
            "finalMessage"
        );

    const memoriesScreen =
        document.getElementById(
            "memories"
        );

    if (finalScreen) {

        finalScreen.style.display =
            "none";
    }

    if (memoriesScreen) {

        memoriesScreen.style.display =
            "flex";
    }

    currentMemory = 0;

    displayMemory();

    if (slideshowTimer) {

        clearInterval(
            slideshowTimer
        );
    }

    slideshowTimer =
        setInterval(() => {

            if (
                currentMemory <
                memories.length - 1
            ) {

                currentMemory++;

                displayMemory();

            } else {

                clearInterval(
                    slideshowTimer
                );

                slideshowTimer = null;

                setTimeout(() => {

                    showFinalMessage();

                }, 5000);
            }

        }, 8000);
}


// ===============================
// ONE LAST SURPRISE
// ===============================

function openLastSurprise() {

    const screen =
        document.getElementById(
            "lastSurprise"
        );

    if (!screen) {
        return;
    }

    screen.style.display =
        "flex";
}


function closeLastSurprise() {

    const screen =
        document.getElementById(
            "lastSurprise"
        );

    if (!screen) {
        return;
    }

    screen.style.display =
        "none";
}


// ===============================
// OPEN LETTER
// ===============================

function openLetter() {

    const letterScreen =
        document.getElementById(
            "letterScreen"
        );

    if (!letterScreen) {
        return;
    }

    letterScreen.style.display =
        "flex";

    letterScreen.classList.remove(
        "opening"
    );

    letterScreen.classList.remove(
        "opened"
    );

    const paper =
        document.querySelector(
            ".letter-paper"
        );

    if (paper) {

        paper.scrollTop = 0;
    }

    createLetterHearts();
}


// ===============================
// REVEAL LETTER
// ===============================

function revealLetter() {

    const letterScreen =
        document.getElementById(
            "letterScreen"
        );

    const button =
        document.getElementById(
            "openLetterButton"
        );

    if (!letterScreen) {
        return;
    }

    letterScreen.classList.add(
        "opening"
    );

    if (button) {

        button.disabled = true;
    }

    setTimeout(() => {

        letterScreen.classList.add(
            "opened"
        );

        createLetterHearts();

    }, 1200);
}


// ===============================
// CLOSE LETTER
// ===============================

function closeLetter() {

    const letterScreen =
        document.getElementById(
            "letterScreen"
        );

    const button =
        document.getElementById(
            "openLetterButton"
        );

    if (!letterScreen) {
        return;
    }

    letterScreen.classList.remove(
        "opening"
    );

    letterScreen.classList.remove(
        "opened"
    );

    if (button) {

        button.disabled = false;
    }

    setTimeout(() => {

        letterScreen.style.display =
            "none";

    }, 400);
}


// ===============================
// LETTER HEARTS
// ===============================

function createLetterHearts() {

    const symbols = [
        "❤️",
        "💕",
        "💖",
        "💗",
        "🌸"
    ];

    for (let i = 0; i < 12; i++) {

        setTimeout(() => {

            const heart =
                document.createElement(
                    "div"
                );

            heart.innerText =
                symbols[
                    Math.floor(
                        Math.random() *
                        symbols.length
                    )
                ];

            heart.style.position =
                "fixed";

            heart.style.left =
                Math.random() * 100 +
                "vw";

            heart.style.bottom =
                "-40px";

            heart.style.fontSize =
                (16 +
                    Math.random() * 22) +
                "px";

            heart.style.zIndex =
                "31000";

            heart.style.pointerEvents =
                "none";

            document.body.appendChild(
                heart
            );

            const drift =
                (Math.random() - 0.5) *
                180;

            const animation =
                heart.animate(
                    [
                        {
                            transform:
                                "translate(0,0) scale(.5)",

                            opacity: 0
                        },

                        {
                            transform:
                                `translate(${drift / 2}px,-50vh) scale(1)`,

                            opacity: 1
                        },

                        {
                            transform:
                                `translate(${drift}px,-110vh) scale(.8)`,

                            opacity: 0
                        }
                    ],

                    {
                        duration:
                            5000 +
                            Math.random() * 3000,

                        easing: "ease-out"
                    }
                );

            animation.onfinish = () => {

                heart.remove();
            };

        }, i * 250);
    }
}


// ===============================
// MUSIC
// ===============================

function startMusic() {

    const music =
        document.getElementById(
            "birthdayMusic"
        );

    if (!music) {
        return;
    }

    music.volume = 0.8;

    music.currentTime = 0;

    music.play()
        .then(() => {

            musicStarted = true;

            updateMusicButton(true);

        })
        .catch(error => {

            console.log(
                "Music autoplay blocked:",
                error
            );

            updateMusicButton(false);
        });
}


// ===============================
// TOGGLE MUSIC
// ===============================

function toggleMusic() {

    const music =
        document.getElementById(
            "birthdayMusic"
        );

    if (!music) {
        return;
    }

    if (music.paused) {

        music.play()
            .then(() => {

                musicStarted = true;

                updateMusicButton(true);

            })
            .catch(error => {

                console.log(
                    "Music error:",
                    error
                );
            });

    } else {

        music.pause();

        musicStarted = false;

        updateMusicButton(false);
    }
}


// ===============================
// MUSIC BUTTON
// ===============================

function updateMusicButton(playing) {

    const button =
        document.getElementById(
            "musicToggle"
        );

    if (!button) {
        return;
    }

    if (playing) {

        button.innerHTML = "🎵";

        button.classList.add(
            "playing"
        );

    } else {

        button.innerHTML = "🔇";

        button.classList.remove(
            "playing"
        );
    }
}


// ===============================
// VOLUME
// ===============================

function changeVolume(value) {

    const music =
        document.getElementById(
            "birthdayMusic"
        );

    if (!music) {
        return;
    }

    music.volume =
        Number(value);
}