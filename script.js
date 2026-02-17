const gameData = {
    stages: [
        {
            name: "Stage 1",
            title: "The Hexagon Riddle",
            question:
                "Find the number of a hexagon and add the number of sides of a triangle. What number do you get?",
            answers: ["9", "nine"],
            hint: "A hexagon has 6 sides. A triangle has 3 sides.",
            difficulty: "Easy",
        },
        {
            name: "Stage 2",
            title: "Planets",
            question: "How many planets are in the Solar System (excluding Pluto)?",
            answers: ["8", "eight"],
            hint: "Pluto is a dwarf planet.",
            difficulty: "Easy",
        },
        {
            name: "Stage 3",
            title: "Continents",
            question: "How many continents are there on Earth? Now subtract 1.",
            answers: ["6", "six"],
            hint: "Most people learn there are 7 continents.",
            difficulty: "Medium",
        },
        {
            name: "Final Stage",
            title: "The Hardest One",
            question:
                "If there are three, you have three. If there are two, you have two. But if there is one, you have none. What is it?",
            answers: ["choice", "the choice", "options", "option"],
            hint: "It only exists when there are at least two.",
            difficulty: "Hard",
        },
    ],
};

const RANKING_KEY = "riddles_ranking";

function loadRanking() {
    try {
        const raw = localStorage.getItem(RANKING_KEY);
        if (!raw) return { bestTimeMs: null, bestAttempts: null, runs: [] };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") throw new Error("invalid");
        parsed.runs = Array.isArray(parsed.runs) ? parsed.runs : [];
        return {
            bestTimeMs: Number.isFinite(parsed.bestTimeMs) ? parsed.bestTimeMs : null,
            bestAttempts: Number.isFinite(parsed.bestAttempts) ? parsed.bestAttempts : null,
            runs: parsed.runs
                .filter(r => r && Number.isFinite(r.timeMs) && Number.isFinite(r.attempts) && typeof r.at === "string")
                .slice(0, 20),
        };
    } catch {
        return { bestTimeMs: null, bestAttempts: null, runs: [] };
    }
}

function saveRanking(state) {
    localStorage.setItem(RANKING_KEY, JSON.stringify(state));
}

function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    if (m <= 0) return `${s}s`;
    return `${m}m ${String(s).padStart(2, "0")}s`;
}

const $ = (id) => document.getElementById(id);

const els = {
    stageLabel: $("stageLabel"),
    stageCount: $("stageCount"),
    progressBar: $("progressBar"),

    stageTitle: $("stageTitle"),
    question: $("question"),
    difficultyText: $("difficultyText"),
    attemptsText: $("attemptsText"),
    timerText: $("timerText"),

    answerInput: $("answerInput"),
    sendBtn: $("sendBtn"),
    hintBtn: $("hintBtn"),
    hintText: $("hintText"),
    feedback: $("feedback"),

    openRankingBtn: $("openRankingBtn"),
    rankingModal: $("rankingModal"),
    closeRankingBtn: $("closeRankingBtn"),
    clearRankingBtn: $("clearRankingBtn"),
    bestTimeText: $("bestTimeText"),
    bestAttemptsText: $("bestAttemptsText"),
    runsList: $("runsList"),
};

let currentStage = 0;
let attempts = 0;   
let totalAttempts = 0;  
let hintOpen = false;

let runStartMs = 0;
let timerId = null;

function normalize(text) {
    return String(text || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function setFeedback(message, type) {
    els.feedback.textContent = message || "";
    els.feedback.className = "font-clean text-sm min-h-[20px] " + (type === "ok"
        ? "text-emerald-300"
        : type === "err"
            ? "text-red-300"
            : "text-zinc-400");
}

function updateProgress() {
    const total = gameData.stages.length;
    const human = Math.min(currentStage + 1, total);

    els.stageLabel.textContent = gameData.stages[currentStage]?.name || "Completed";
    els.stageCount.textContent = `${human}/${total}`;

    const pct = Math.round((currentStage / total) * 100);
    els.progressBar.style.width = `${pct}%`;
}

function updateTimerUI() {
    const now = Date.now();
    els.timerText.textContent = `Time: ${formatTime(now - runStartMs)}`;
}

function startTimer() {
    runStartMs = Date.now();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(updateTimerUI, 250);
    updateTimerUI();
}

function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
}

function loadStage() {
    const stage = gameData.stages[currentStage];

    attempts = 0;
    hintOpen = false;

    els.stageTitle.textContent = stage.title;
    els.question.textContent = stage.question;
    els.difficultyText.textContent = `Difficulty: ${stage.difficulty}`;

    els.attemptsText.textContent = `Attempts: ${attempts}`;
    els.answerInput.value = "";
    els.answerInput.focus();

    els.hintText.classList.add("hidden");
    els.hintText.textContent = stage.hint;
    els.hintBtn.textContent = "Show hint";

    setFeedback("", null);
    updateProgress();
}

function toggleHint() {
    hintOpen = !hintOpen;
    if (hintOpen) {
        els.hintText.classList.remove("hidden");
        els.hintBtn.textContent = "Hide hint";
    } else {
        els.hintText.classList.add("hidden");
        els.hintBtn.textContent = "Show hint";
    }
}

function clearInput() {
    els.answerInput.value = "";
    setFeedback("", null);
    els.answerInput.focus();
}

function checkAnswer() {
    const stage = gameData.stages[currentStage];
    const user = normalize(els.answerInput.value);

    if (!user) {
        setFeedback("Type an answer first.", "err");
        return;
    }

    attempts += 1;
    totalAttempts += 1;
    els.attemptsText.textContent = `Attempts: ${attempts}`;

    const valid = stage.answers.map(normalize);
    if (valid.includes(user)) {
        setFeedback("Correct.", "ok");
        setTimeout(nextStage, 220);
    } else {
        setFeedback("Wrong answer. Try again.", "err");
    }
}

function nextStage() {
    currentStage += 1;

    if (currentStage < gameData.stages.length) {
        loadStage();
        return;
    }

    // finish
    stopTimer();
    els.progressBar.style.width = "100%";

    const runTimeMs = Date.now() - runStartMs;
    saveRunToRanking(runTimeMs, totalAttempts);
    renderWin(runTimeMs, totalAttempts);
}

function renderWin(runTimeMs, runAttempts) {
    const section = document.querySelector("section.mt-10");
    section.innerHTML = `
    <div class="space-y-4 animate-fadeUp">
      <p class="font-enigmatic text-2xl tracking-wide text-zinc-50">Completed.</p>
      <p class="font-clean text-zinc-300">
        Time: <span class="text-zinc-50 font-semibold">${formatTime(runTimeMs)}</span>
        • Attempts: <span class="text-zinc-50 font-semibold">${runAttempts}</span>
      </p>
      <div class="flex gap-3 flex-wrap pt-2">
        <button id="restartBtn" class="rounded-xl bg-white/10 px-5 py-3 font-clean font-semibold text-white hover:opacity-95 active:opacity-90 transition">Restart</button>
        <button id="viewRankingBtn" class="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-clean font-semibold text-zinc-100 hover:bg-white/10 transition">View ranking</button>
      </div>
      <p class="font-clean text-sm text-zinc-500 pt-2">Tip: add new stages in <code class="text-zinc-300">gameData.stages</code>.</p>
    </div>
    `;

    document.getElementById("restartBtn").addEventListener("click", () => {
        window.location.reload();
    });

    document.getElementById("viewRankingBtn").addEventListener("click", () => {
        openRanking();
    });
}

function saveRunToRanking(timeMs, attemptsTotal) {
    const rank = loadRanking();

    rank.runs.unshift({
        at: new Date().toISOString(),
        timeMs,
        attempts: attemptsTotal,
    });

    rank.runs = rank.runs.slice(0, 20);

    if (rank.bestTimeMs === null || timeMs < rank.bestTimeMs) {
        rank.bestTimeMs = timeMs;
    }

    if (rank.bestAttempts === null || attemptsTotal < rank.bestAttempts) {
        rank.bestAttempts = attemptsTotal;
    }

    saveRanking(rank);
}

function renderRanking() {
    const rank = loadRanking();

    els.bestTimeText.textContent = rank.bestTimeMs === null ? "—" : formatTime(rank.bestTimeMs);
    els.bestAttemptsText.textContent = rank.bestAttempts === null ? "—" : String(rank.bestAttempts);

    if (!rank.runs.length) {
        els.runsList.innerHTML = `<p class="font-clean text-sm text-zinc-400">No runs yet.</p>`;
        return;
    }

    els.runsList.innerHTML = rank.runs
        .map((r, i) => {
            const dt = new Date(r.at);
            const label = Number.isFinite(dt.getTime())
                ? dt.toLocaleString()
                : r.at;
            return `
            <div class="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <div class="font-clean text-xs text-zinc-400">${i + 1}. ${label}</div>
                <div class="font-clean text-xs text-zinc-200">${formatTime(r.timeMs)} • ${r.attempts} attempts</div>
            </div>
            `;
        })
        .join("");
}

function openRanking() {
    renderRanking();
    els.rankingModal.classList.remove("hidden");
}

function closeRanking() {
    els.rankingModal.classList.add("hidden");
}

function clearRanking() {
    localStorage.removeItem(RANKING_KEY);
    renderRanking();
}

els.sendBtn.addEventListener("click", checkAnswer);
els.hintBtn.addEventListener("click", toggleHint);

els.answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
    if (e.key === "Escape") clearInput();
});

els.openRankingBtn.addEventListener("click", openRanking);
els.closeRankingBtn.addEventListener("click", closeRanking);
els.clearRankingBtn.addEventListener("click", clearRanking);

els.rankingModal.addEventListener("click", (e) => {
    if (e.target === els.rankingModal || e.target === els.rankingModal.firstElementChild) {
        closeRanking();
    }
});

window.addEventListener("load", () => {
    currentStage = 0;
    attempts = 0;
    totalAttempts = 0;

    startTimer();
    loadStage();
});
