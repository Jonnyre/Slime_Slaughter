"use strict";
var Endabgabe;
(function (Endabgabe) {
    window.addEventListener("load", init);
    let isControlsVisible = false;
    async function init() {
        let level1 = document.getElementById("level1");
        level1.addEventListener("click", () => clickLevel(1));
        let level2 = document.getElementById("level2");
        level2.addEventListener("click", () => clickLevel(2));
        let level3 = document.getElementById("level3");
        level3.addEventListener("click", () => clickLevel(3));
        let level4 = document.getElementById("level4");
        level4.addEventListener("click", () => clickLevel(4));
        let level5 = document.getElementById("level5");
        level5.addEventListener("click", () => clickLevel(5));
        let howToPlay = document.getElementById("howToPlay");
        howToPlay.addEventListener("click", hndHowToPlay);
    }
    function clickLevel(_level) {
        window.location.href = "../Endabgabe.html?id=" + _level;
    }
    function hndHowToPlay() {
        isControlsVisible = !isControlsVisible;
        let controls = document.getElementById("controls");
        if (isControlsVisible)
            controls.style.visibility = "hidden";
        else
            controls.style.visibility = "visible";
    }
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=LevelSelect.js.map