/* =========================================
   MINDDUMP — THIRD.JS
   Frontend-only productivity assistant
========================================= */


/* =========================================
   SCREEN MANAGEMENT
========================================= */

const screens = {
    home: document.getElementById("home-screen"),
    processing: document.getElementById("processing-screen"),
    dashboard: document.getElementById("dashboard-screen"),
    flow: document.getElementById("flow-screen"),
    break: document.getElementById("break-screen"),
    complete: document.getElementById("complete-screen")
};

function showScreen(screenName) {

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[screenName].classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================
   DATA
========================================= */

let tasks = [];
let currentTaskIndex = 0;

let timerInterval = null;
let breakInterval = null;

let taskTimeRemaining = 0;
let breakTimeRemaining = 0;

let taskTotalSeconds = 0;
let breakTotalSeconds = 0;

let isPaused = false;


/* =========================================
   EXAMPLE BRAIN DUMPS
========================================= */

const examples = {

    school: `
I have a Computer Science assignment due tomorrow.
I need to study for my networking test.
I haven't finished my programming notes.
I need to submit my assignment before 5pm.
I should revise cybersecurity.
I also need to reply to my group members.
`,

    work: `
I need to finish the report today.
Send the client the updated document.
Reply to the emails in my inbox.
Prepare for tomorrow's meeting.
Update the spreadsheet.
I also need to follow up with the team.
`,

    life: `
I need to clean my room.
Buy groceries.
Call Mum.
Do my laundry.
Pay my bills.
Book an appointment.
I also want to get some rest.
`,

    everything: `
I have an assignment due tomorrow.
I need to study for my test.
Reply to Sarah.
Buy groceries.
Finish the work report.
Call Mum.
Clean my room.
Pay my bills.
Prepare for tomorrow's meeting.
I really need to get some rest.
`
};


/* =========================================
   EXAMPLE BUTTONS
========================================= */

document.querySelectorAll(".example-btn").forEach(button => {

    button.addEventListener("click", function () {

        const exampleType = this.getAttribute("data-example");
        const textarea = document.getElementById("brain-dump");

        if (!textarea) {
            console.error("Brain dump textarea not found.");
            return;
        }

        if (!examples[exampleType]) {
            console.error("Example not found:", exampleType);
            return;
        }

        textarea.value = examples[exampleType].trim();

        textarea.focus();

        textarea.setSelectionRange(
            textarea.value.length,
            textarea.value.length
        );

    });

});


/* =========================================
   ORGANIZE THOUGHTS
========================================= */

document
    .getElementById("organize-btn")
    .addEventListener("click", organizeThoughts);


function organizeThoughts() {

    const input =
        document.getElementById("brain-dump").value.trim();

    if (!input) {

        alert(
            "Dump something first. Your mind doesn't have to be organized."
        );

        return;
    }

    showScreen("processing");

    runProcessing();
}


/* =========================================
   PROCESSING ANIMATION
========================================= */

function runProcessing() {

    const messages = [
        "Reading your thoughts...",
        "Finding everything you need to do...",
        "Figuring out what matters first...",
        "Building a plan that feels manageable..."
    ];

    const messageElement =
        document.getElementById("processing-message");

    let index = 0;

    messageElement.textContent = messages[0];

    const interval = setInterval(() => {

        index++;

        if (index < messages.length) {

            messageElement.textContent =
                messages[index];

        }

    }, 650);


    setTimeout(() => {

        clearInterval(interval);

        createTasks();

        showDashboard();

    }, 3000);
}


/* =========================================
   CREATE TASKS
========================================= */

function createTasks() {

    const input =
        document.getElementById("brain-dump").value.trim();

    const lines = input
        .split(/\n|[.!?]/)
        .map(item => item.trim())
        .filter(item => item.length > 3);


    tasks = lines.map((text, index) => {

        let priority = "low";

        const lower = text.toLowerCase();


        if (
            lower.includes("tomorrow") ||
            lower.includes("today") ||
            lower.includes("due") ||
            lower.includes("deadline") ||
            lower.includes("urgent") ||
            lower.includes("submit") ||
            lower.includes("exam") ||
            lower.includes("test")
        ) {

            priority = "high";

        }

        else if (
            lower.includes("need") ||
            lower.includes("finish") ||
            lower.includes("prepare") ||
            lower.includes("reply") ||
            lower.includes("send") ||
            lower.includes("study")
        ) {

            priority = "medium";

        }


        return {

            id: index + 1,

            title: capitalize(text),

            priority: priority,

            duration: estimateDuration(text),

            completed: false

        };

    });


    if (tasks.length === 0) {

        tasks = [
            {
                id: 1,
                title: "Work through your brain dump",
                priority: "medium",
                duration: 25,
                completed: false
            }
        ];

    }

}


/* =========================================
   CAPITALIZE
========================================= */

function capitalize(text) {

    return text.charAt(0).toUpperCase() + text.slice(1);

}


/* =========================================
   ESTIMATE TASK TIME
========================================= */

function estimateDuration(text) {

    const length = text.length;

    if (length < 35) return 15;

    if (length < 65) return 25;

    if (length < 100) return 35;

    return 45;

}


/* =========================================
   DASHBOARD
========================================= */

function showDashboard() {

    updateDashboard();

    showScreen("dashboard");

}


/* =========================================
   UPDATE DASHBOARD
========================================= */

function updateDashboard() {

    const high =
        tasks.filter(task => task.priority === "high");

    const medium =
        tasks.filter(task => task.priority === "medium");

    const low =
        tasks.filter(task => task.priority === "low");


    document.getElementById("total-tasks")
        .textContent = tasks.length;

    document.getElementById("urgent-tasks")
        .textContent = high.length;


    const totalMinutes =
        tasks.reduce(
            (sum, task) => sum + task.duration,
            0
        );


    document.getElementById("total-time")
        .textContent = `${totalMinutes}m`;


    const brainLoad = Math.min(
        95,
        Math.max(
            25,
            tasks.length * 12 + high.length * 5
        )
    );


    document.getElementById("brain-load-score")
        .textContent = `${brainLoad}%`;

    document.getElementById("brain-load-progress")
        .style.width = `${brainLoad}%`;


    document.getElementById("summary")
        .textContent =
        `We've turned ${tasks.length} thought${tasks.length === 1 ? "" : "s"} into a plan.`;


    renderTasks("high-tasks", high);
    renderTasks("medium-tasks", medium);
    renderTasks("low-tasks", low);

    renderPlan();

}


/* =========================================
   RENDER TASKS
========================================= */

function renderTasks(containerId, taskList) {

    const container =
        document.getElementById(containerId);

    container.innerHTML = "";


    if (taskList.length === 0) {

        container.innerHTML = `
            <div class="empty-task">
                Nothing here.
            </div>
        `;

        return;
    }


    taskList.forEach(task => {

        const card =
            document.createElement("div");

        card.className = "task-card";


        card.innerHTML = `
            <div class="task-card-title">
                ${escapeHTML(task.title)}
            </div>

            <div class="task-card-meta">
                <span>⏱ ${task.duration} min</span>
                <span>${task.priority}</span>
            </div>
        `;


        container.appendChild(card);

    });

}


/* =========================================
   RENDER MINDFLOW PLAN
========================================= */

function renderPlan() {

    const container =
        document.getElementById("plan-list");

    container.innerHTML = "";


    tasks.forEach((task, index) => {

        const item =
            document.createElement("div");

        item.className = "plan-item";


        item.innerHTML = `
            <div class="plan-number">
                ${index + 1}
            </div>

            <div>
                <strong>
                    ${escapeHTML(task.title)}
                </strong>

                <small>
                    ${task.duration} min · ${capitalize(task.priority)} priority
                </small>
            </div>
        `;


        container.appendChild(item);

    });

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================
   START MINDFLOW
========================================= */

document
    .getElementById("start-flow-btn")
    .addEventListener("click", startFlow);


function startFlow() {

    if (!tasks.length) return;

    currentTaskIndex = 0;

    tasks.forEach(task => {
        task.completed = false;
    });

    startTask();

}


/* =========================================
   START TASK
========================================= */

function startTask() {

    clearTimers();

    isPaused = false;

    const task =
        tasks[currentTaskIndex];


    if (!task) {

        completeFlow();

        return;
    }


    showScreen("flow");


    document.getElementById("focus-status")
        .textContent =
        `Task ${currentTaskIndex + 1} of ${tasks.length}`;


    document.getElementById("flow-task")
        .textContent = task.title;


    document.getElementById("flow-message")
        .textContent =
        "One thing at a time. You've got this.";


    document.getElementById("pause-btn")
        .textContent = "Pause";


    updateNextTask();


    taskTotalSeconds =
        task.duration * 60;

    taskTimeRemaining =
        taskTotalSeconds;


    updateTaskTimerDisplay();


    timerInterval = setInterval(() => {

        if (isPaused) return;

        taskTimeRemaining--;

        updateTaskTimerDisplay();


        if (taskTimeRemaining <= 0) {

            finishTask();

        }

    }, 1000);

}


/* =========================================
   TASK TIMER DISPLAY
========================================= */

function updateTaskTimerDisplay() {

    document.getElementById("timer")
        .textContent =
        formatTime(taskTimeRemaining);


    const percentage =
        (taskTimeRemaining / taskTotalSeconds) * 100;


    document.getElementById("timer-progress")
        .style.width =
        `${Math.max(0, percentage)}%`;

}


/* =========================================
   FORMAT TIME
========================================= */

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;


    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

}


/* =========================================
   NEXT TASK
========================================= */

function updateNextTask() {

    const next =
        tasks[currentTaskIndex + 1];

    const name =
        document.getElementById("next-task-name");

    const duration =
        document.getElementById("next-task-duration");


    if (!next) {

        name.textContent =
            "You're on your final task";

        duration.textContent =
            "Almost there";

        return;
    }


    name.textContent =
        next.title;

    duration.textContent =
        `${next.duration} min`;

}


/* =========================================
   PAUSE
========================================= */

document
    .getElementById("pause-btn")
    .addEventListener("click", togglePause);


function togglePause() {

    isPaused = !isPaused;


    const button =
        document.getElementById("pause-btn");


    if (isPaused) {

        button.textContent = "Resume";

        document.getElementById("flow-message")
            .textContent =
            "Paused. Take your time.";

    } else {

        button.textContent = "Pause";

        document.getElementById("flow-message")
            .textContent =
            "One thing at a time. You've got this.";

    }

}


/* =========================================
   FINISH TASK
========================================= */

function finishTask() {

    clearTimers();

    tasks[currentTaskIndex].completed = true;

    playBeep();


    if (currentTaskIndex >= tasks.length - 1) {

        completeFlow();

        return;
    }


    startBreak();

}


/* =========================================
   SKIP TASK
========================================= */

document
    .getElementById("skip-btn")
    .addEventListener("click", skipTask);


function skipTask() {

    clearTimers();

    tasks[currentTaskIndex].completed = true;

    playBeep();


    if (currentTaskIndex >= tasks.length - 1) {

        completeFlow();

        return;
    }


    /* Break will advance to the next task */

    startBreak();

}


/* =========================================
   END CURRENT TASK
========================================= */

document
    .getElementById("end-btn")
    .addEventListener("click", endFlow);


function endFlow() {

    clearTimers();

    completeFlow();

}


/* =========================================
   BREAK SYSTEM
========================================= */

function startBreak() {

    clearTimers();

    isPaused = false;

    showScreen("break");


    const next =
        tasks[currentTaskIndex + 1];


    document.getElementById("break-status")
        .textContent =
        `BREAK · ${currentTaskIndex + 1} OF ${tasks.length}`;


    if (next) {

        document.getElementById("break-next-task")
            .textContent =
            next.title;

        document.getElementById("break-next-duration")
            .textContent =
            `${next.duration} min`;

    } else {

        document.getElementById("break-next-task")
            .textContent =
            "Flow complete";

        document.getElementById("break-next-duration")
            .textContent =
            "You're almost done";

    }


    breakTotalSeconds =
        5 * 60;

    breakTimeRemaining =
        breakTotalSeconds;


    updateBreakDisplay();


    breakInterval = setInterval(() => {

        breakTimeRemaining--;

        updateBreakDisplay();


        if (breakTimeRemaining <= 0) {

            finishBreak();

        }

    }, 1000);

}


/* =========================================
   BREAK TIMER DISPLAY
========================================= */

function updateBreakDisplay() {

    document.getElementById("break-timer")
        .textContent =
        formatTime(breakTimeRemaining);


    const percentage =
        (breakTimeRemaining / breakTotalSeconds) * 100;


    document.getElementById("break-progress")
        .style.width =
        `${Math.max(0, percentage)}%`;


    if (breakTimeRemaining <= 60) {

        document.getElementById("break-message")
            .textContent =
            "Almost time. Get ready for the next one.";

    } else if (breakTimeRemaining <= 180) {

        document.getElementById("break-message")
            .textContent =
            "Relax your shoulders. Take a deep breath.";

    } else {

        document.getElementById("break-message")
            .textContent =
            "Breathe. Stretch. Get some water.";

    }

}


/* =========================================
   FINISH BREAK
========================================= */

function finishBreak() {

    clearTimers();

    playBeep();

    currentTaskIndex++;

    startTask();

}


/* =========================================
   SKIP BREAK
========================================= */

document
    .getElementById("skip-break-btn")
    .addEventListener("click", skipBreak);


function skipBreak() {

    clearTimers();

    playBeep();

    currentTaskIndex++;

    startTask();

}


/* =========================================
   END FLOW FROM BREAK
========================================= */

document
    .getElementById("end-flow-btn")
    .addEventListener("click", endFlow);


/* =========================================
   COMPLETE FLOW
========================================= */

function completeFlow() {

    clearTimers();

    showScreen("complete");

}


/* =========================================
   NEW BRAIN DUMP
========================================= */

document
    .getElementById("new-dump-btn")
    .addEventListener("click", newDump);


document
    .getElementById("restart-btn")
    .addEventListener("click", newDump);


function newDump() {

    clearTimers();

    tasks = [];

    currentTaskIndex = 0;

    isPaused = false;


    document.getElementById("brain-dump")
        .value = "";


    document.getElementById("pause-btn")
        .textContent = "Pause";


    showScreen("home");

}


/* =========================================
   CLEAR TIMERS
========================================= */

function clearTimers() {

    if (timerInterval) {

        clearInterval(timerInterval);

        timerInterval = null;

    }


    if (breakInterval) {

        clearInterval(breakInterval);

        breakInterval = null;

    }

}


/* =========================================
   SOUND
========================================= */

function playBeep() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) return;


        const context =
            new AudioContext();


        const oscillator =
            context.createOscillator();


        const gainNode =
            context.createGain();


        oscillator.type = "sine";


        oscillator.frequency.setValueAtTime(
            700,
            context.currentTime
        );


        gainNode.gain.setValueAtTime(
            0.15,
            context.currentTime
        );


        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.4
        );


        oscillator.connect(gainNode);

        gainNode.connect(context.destination);


        oscillator.start();

        oscillator.stop(
            context.currentTime + 0.4
        );


    } catch (error) {

        console.log(
            "Sound unavailable:",
            error
        );

    }

}


/* =========================================
   INITIAL SCREEN
========================================= */

showScreen("home");