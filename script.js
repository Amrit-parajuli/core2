document.addEventListener("DOMContentLoaded", function () {

    // Supabase client initialization (replace with your values)
    const supabaseUrl = "https://olqsmfkirbrkjfrqgtap.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scXNtZmtpcmJya2pmcnFndGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDQwMTgsImV4cCI6MjA4NzA4MDAxOH0.MaQKJoDAUEidgGxWP2zACN9PlgLIyoPrd5B6xFyCqzk";

    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Load total clicks from localStorage
    let clickCount = parseInt(localStorage.getItem("totalClicks")) || 0;

    const btn = document.getElementById("supportBtn");
    const sound1 = document.getElementById("sound1");
    const sound2 = document.getElementById("sound2");
    const sound3 = document.getElementById("sound3");
    const swastik = document.getElementById("swastikFlash");

    const dashboard = document.getElementById("countDashboard");
    const countNumber = document.getElementById("countNumber");

    // Display the total clicks on page load
    countNumber.textContent = clickCount;

    // Supabase counter functions
    async function loadCounter() {
        const { data, error } = await supabase
            .from("counter")
            .select("count")
            .eq("id", 1)
            .single();

        if (!error && data) {
            clickCount = data.count;
            countNumber.textContent = data.count;
            localStorage.setItem("totalClicks", clickCount);
        }
    }

    async function increaseCounter() {
        const { data } = await supabase
            .from("counter")
            .select("count")
            .eq("id", 1)
            .single();

        let newCount = (data && typeof data.count === 'number') ? data.count + 1 : clickCount + 1;

        await supabase
            .from("counter")
            .update({ count: newCount })
            .eq("id", 1);

        clickCount = newCount;
        localStorage.setItem("totalClicks", clickCount);
        countNumber.textContent = newCount;
    }

    // Load remote counter on start
    loadCounter();

    btn.addEventListener("click", function () {

        clickCount++;
        
        // Save total clicks to localStorage
        localStorage.setItem("totalClicks", clickCount);
        
        /* ---------- UPDATE DASHBOARD ---------- */
        countNumber.textContent = clickCount;

        /* ---------- SOUND (cycle among 3) ---------- */
        if (sound1) { sound1.pause(); sound1.currentTime = 0; }
        if (sound2) { sound2.pause(); sound2.currentTime = 0; }
        if (sound3) { sound3.pause(); sound3.currentTime = 0; }

        const mod = clickCount % 3;
        if (mod === 1) {
            if (sound1) sound1.play();
        } else if (mod === 2) {
            if (sound2) sound2.play();
        } else {
            if (sound3) sound3.play();
        }

        /* ---------- CONFETTI ---------- */
        confetti({
            particleCount: 100,
            spread: 90,
            origin: { y: 0.6 }
        });

        /* ---------- SWASTIK FLASH ---------- */
        swastik.classList.remove("swastik-active");

        // Force reflow so animation restarts every click
        void swastik.offsetWidth;

        swastik.classList.add("swastik-active");

        // update server counter (keeps local sound/confetti immediate)
        increaseCounter();

    });
    const langToggle = document.getElementById("langToggle");
let isEnglish = false;

langToggle.addEventListener("click", function () {

    const titles = document.querySelectorAll(".event-title");
    const descs = document.querySelectorAll(".event-desc");
    const kandaTitle = document.getElementById("kandaTitle");

    if (!isEnglish) {

        // Switch to English
        kandaTitle.textContent = "Our Controversies";

        titles[0].textContent = "Damak View Tower";
        descs[0].textContent = "Project controversy regarding budget allocation and public criticism.";

        titles[1].textContent = "Giri Bandhu Tea Estate";
        descs[1].textContent = "Land policy changes raised political and legal debates.";

        langToggle.textContent = "नेपाली";
        isEnglish = true;

    } else {

        // Switch back to Nepali
        kandaTitle.textContent = "हाम्रो काण्ड";

        titles[0].textContent = "दमक भ्यू टावर";
        descs[0].textContent = "यहाँ विवरण लेख्नुहोस्...";

        titles[1].textContent = "गिरिबन्धु चिया बगान";
        descs[1].textContent = "यहाँ विवरण लेख्नुहोस्...";

        langToggle.textContent = "EN";
        isEnglish = false;
    }
    


});


});

// Realtime subscription to counter updates
supabase
    .channel("counter-channel")
    .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "counter" },
        payload => {
            countNumber.textContent = payload.new.count;
            clickCount = payload.new.count;
            localStorage.setItem("totalClicks", clickCount);
        }
    )
    .subscribe();

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
