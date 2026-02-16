document.addEventListener("DOMContentLoaded", function () {

    let clickCount = 0;

    const btn = document.getElementById("supportBtn");
    const sound1 = document.getElementById("sound1");
    const sound2 = document.getElementById("sound2");
    const swastik = document.getElementById("swastikFlash");

    btn.addEventListener("click", function () {

        clickCount++;

        /* ---------- SOUND ---------- */
        sound1.pause();
        sound2.pause();
        sound1.currentTime = 0;
        sound2.currentTime = 0;

        if (clickCount % 2 === 1) {
            sound1.play();
        } else {
            sound2.play();
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
