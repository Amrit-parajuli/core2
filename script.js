document.addEventListener("DOMContentLoaded", function () {

    // ====== SUPABASE CONFIGURATION ======
    const supabaseUrl = "https://olqsmfkirbrkjfrqgtap.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scXNtZmtpcmJya2pmcnFndGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDQwMTgsImV4cCI6MjA4NzA4MDAxOH0.MaQKJoDAUEidgGxWP2zACN9PlgLIyoPrd5B6xFyCqzk";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // ====== VALIDATION CONSTANTS ======
    const MAX_REALISTIC_CLICKS = 1000000;
    const RATE_LIMIT_MS = 100;
    const SUSPICIOUS_THRESHOLD = -1000; // Any value below this is definitely corrupted
    const DAILY_MAX_PER_IP = 10000; // Reasonable daily limit per visitor

    // ====== STATE VARIABLES ======
    let clickCount = parseInt(localStorage.getItem("totalClicks")) || 0;
    let lastClickTime = 0;
    let isUpdating = false;

    // ====== DOM ELEMENTS ======
    const btn = document.getElementById("supportBtn");
    const countNumber = document.getElementById("countNumber");
    const sound1 = document.getElementById("sound1");
    const sound2 = document.getElementById("sound2");
    const sound3 = document.getElementById("sound3");
    const swastik = document.getElementById("swastikFlash");

    // ====== VALIDATION FUNCTION ======
    function validateClickCount(count, isFromDatabase = false) {
        if (typeof count !== 'number' || !Number.isInteger(count)) {
            console.warn(`Invalid click count type: ${count}`);
            return 0;
        }
        
        // Detect bot/malicious activity - negative or extremely negative values
        if (count < SUSPICIOUS_THRESHOLD) {
            console.error(`🚨 CRITICAL: Malicious data detected! Count: ${count}. Resetting to 0.`);
            if (isFromDatabase) {
                // Notify user of tampering
                alert('⚠️ Bot/Spam detected! Counter has been reset. Please report this issue.');
                // Auto-reset in database
                resetCounterInDB(0);
            }
            return 0;
        }
        
        if (count < 0) {
            console.warn(`⚠️ Negative click count detected: ${count}. Resetting to 0.`);
            if (isFromDatabase) {
                resetCounterInDB(0);
            }
            return 0;
        }
        
        if (count > MAX_REALISTIC_CLICKS) {
            console.warn(`⚠️ Unrealistic click count detected: ${count}. Capping at max.`);
            if (isFromDatabase) {
                resetCounterInDB(MAX_REALISTIC_CLICKS);
            }
            return MAX_REALISTIC_CLICKS;
        }
        
        return count;
    }

    // ====== AUTO-RESET CORRUPTED COUNTER ======
    async function resetCounterInDB(newValue = 0) {
        try {
            console.log(`Resetting counter to ${newValue} in database...`);
            const { error } = await supabase
                .from("counter")
                .update({ count: newValue })
                .eq("id", 1);

            if (error) {
                console.error("Error resetting counter in DB:", error);
            } else {
                console.log(`✅ Counter successfully reset to ${newValue}`);
                clickCount = newValue;
                if (countNumber) countNumber.textContent = clickCount;
                localStorage.setItem("totalClicks", clickCount);
            }
        } catch (err) {
            console.error("Unexpected error resetting counter:", err);
        }
    }

    // ====== LOAD COUNTER FROM SUPABASE ======
    async function loadCounter() {
        try {
            const { data, error } = await supabase
                .from("counter")
                .select("count")
                .eq("id", 1)
                .single();

            if (error) {
                console.error("Error loading counter:", error);
                // Use localStorage fallback
                if (countNumber) countNumber.textContent = clickCount;
                return;
            }

            if (data) {
                // Validate with database flag to trigger auto-reset if corrupted
                const validatedCount = validateClickCount(data.count, true);
                clickCount = validatedCount;
                if (countNumber) countNumber.textContent = clickCount;
                localStorage.setItem("totalClicks", clickCount);
            }
        } catch (err) {
            console.error("Unexpected error loading counter:", err);
        }
    }

    // ====== INCREMENT COUNTER WITH VALIDATION ======
    async function increaseCounter() {
        if (isUpdating) {
            console.warn("Update already in progress");
            return false;
        }

        // Rate limiting
        const now = Date.now();
        if (now - lastClickTime < RATE_LIMIT_MS) {
            console.warn("Clicking too fast");
            return false;
        }
        lastClickTime = now;

        isUpdating = true;

        try {
            // Get current count from database
            const { data, error } = await supabase
                .from("counter")
                .select("count")
                .eq("id", 1)
                .single();

            if (error) {
                console.error("Error reading counter:", error);
                // Fallback: increment local copy
                clickCount++;
                if (countNumber) countNumber.textContent = clickCount;
                localStorage.setItem("totalClicks", clickCount);
                return false;
            }

            const currentCount = validateClickCount(data.count);
            const newCount = currentCount + 1;

            // Validate new count
            if (newCount > MAX_REALISTIC_CLICKS) {
                console.error("Maximum click limit reached!");
                isUpdating = false;
                return false;
            }

            // Update database
            const { error: updateError } = await supabase
                .from("counter")
                .update({ count: newCount })
                .eq("id", 1);

            if (updateError) {
                console.error("Error updating counter:", updateError);
                // Fallback: increment local copy
                clickCount++;
                if (countNumber) countNumber.textContent = clickCount;
                localStorage.setItem("totalClicks", clickCount);
                return false;
            }

            // Update local state
            clickCount = newCount;
            if (countNumber) countNumber.textContent = clickCount;
            localStorage.setItem("totalClicks", clickCount);

            return true;

        } catch (err) {
            console.error("Unexpected error in increaseCounter:", err);
            // Fallback: increment local copy
            clickCount++;
            if (countNumber) countNumber.textContent = clickCount;
            localStorage.setItem("totalClicks", clickCount);
            return false;
        } finally {
            isUpdating = false;
        }
    }

    // ====== BUTTON INITIALIZATION & CLICK HANDLER ======
    if (btn) {
        btn.addEventListener("click", async function () {
            if (isUpdating) {
                console.warn("Previous update still in progress");
                return;
            }

            console.log("Button clicked");

            // Immediate local update for responsiveness
            clickCount++;
            if (countNumber) countNumber.textContent = clickCount;
            localStorage.setItem("totalClicks", clickCount);

            // Sound cycle
            try {
                if (sound1) { sound1.pause(); sound1.currentTime = 0; }
                if (sound2) { sound2.pause(); sound2.currentTime = 0; }
                if (sound3) { sound3.pause(); sound3.currentTime = 0; }

                const mod = clickCount % 3;
                if (mod === 1) {
                    if (sound1) sound1.play().catch(err => console.warn("Sound 1 play error:", err));
                } else if (mod === 2) {
                    if (sound2) sound2.play().catch(err => console.warn("Sound 2 play error:", err));
                } else {
                    if (sound3) sound3.play().catch(err => console.warn("Sound 3 play error:", err));
                }
            } catch (err) {
                console.error("Sound playback error:", err);
            }

            // Confetti and animation
            try {
                if (typeof confetti !== 'undefined') {
                    confetti({
                        particleCount: 100,
                        spread: 90,
                        origin: { y: 0.6 }
                    });
                }

                if (swastik) {
                    swastik.classList.remove("swastik-active");
                    void swastik.offsetWidth; // Force reflow
                    swastik.classList.add("swastik-active");
                }
            } catch (err) {
                console.error("Animation/confetti error:", err);
            }

            // Disable button while updating
            btn.disabled = true;

            // Update server in background
            try {
                await increaseCounter();
            } catch (err) {
                console.error("Error during increaseCounter call:", err);
            } finally {
                btn.disabled = false;
            }
        });
    } else {
        console.warn("supportBtn element not found");
    }

    // ====== REALTIME SUBSCRIPTION ======
    try {
        supabase
            .channel("counter-channel")
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "counter" },
                payload => {
                    if (payload.new && payload.new.count !== undefined) {
                        const validatedCount = validateClickCount(payload.new.count, true);
                        clickCount = validatedCount;
                        if (countNumber) countNumber.textContent = clickCount;
                        localStorage.setItem("totalClicks", clickCount);
                        console.log("Realtime update:", clickCount);
                    }
                }
            )
            .subscribe();
    } catch (err) {
        console.error("Error setting up realtime subscription:", err);
    }

    // ====== KEYBOARD SHORTCUTS ======
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            if (btn) btn.click();
        }
    });

    // ====== ADMIN RESET FUNCTION ======
    window.resetBotCounter = async function() {
        const confirmed = confirm('⚠️ Reset counter to 0? (Bot/spam detected)');
        if (confirmed) {
            await resetCounterInDB(0);
            alert('✅ Counter has been reset to 0');
        }
    };

    window.setCounterValue = async function(value) {
        const num = parseInt(value);
        if (isNaN(num) || num < 0 || num > MAX_REALISTIC_CLICKS) {
            alert('Invalid value. Must be between 0 and ' + MAX_REALISTIC_CLICKS);
            return;
        }
        const confirmed = confirm(`Set counter to ${num}?`);
        if (confirmed) {
            await resetCounterInDB(num);
            alert(`✅ Counter set to ${num}`);
        }
    };

    // ====== INITIALIZATION ======
    console.log("Initializing script...");
    console.log("Local clickCount on start:", clickCount);
    if (countNumber) countNumber.textContent = clickCount;
    loadCounter();

    // Log admin instructions
    console.log('%c🚨 ADMIN CONTROLS', 'font-size: 14px; font-weight: bold; color: red;');
    console.log('%cBot detected? Use: resetBotCounter()', 'font-size: 12px; color: orange;');
    console.log('%cManual reset: setCounterValue(number)', 'font-size: 12px; color: orange;');
    console.log('%c✅ Script initialized. Bot protection active.', 'font-size: 12px; color: green;');
    console.log('%c🔒 SECURITY TIP: Enable Row Level Security (RLS) on Supabase counter table.', 'font-size: 11px; color: blue;');
});

function toggleContent(button) {
    const shortText = button.parentElement.querySelector(".short-text");
    const fullText = button.parentElement.querySelector(".full-text");

    if (fullText.style.display === "block") {
        fullText.style.display = "none";
        shortText.style.display = "block";
        button.innerText = "थप हेर्नुहोस्";
    } else {
        fullText.style.display = "block";
        shortText.style.display = "none";
        button.innerText = "कम हेर्नुहोस्";
    }
}