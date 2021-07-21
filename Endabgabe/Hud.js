"use strict";
var Endabgabe;
(function (Endabgabe) {
    var fui = FudgeUserInterface;
    class GameState extends ƒ.Mutable {
        constructor() {
            super(...arguments);
            this.weapon = "Sword";
            this.bosslife = 0;
            this.avatarLife = 100;
        }
        reduceMutator(_mutator) { }
    }
    Endabgabe.gameState = new GameState();
    class Hud {
        static start() {
            let domHud = document.getElementById("Hud");
            Hud.controller = new fui.Controller(Endabgabe.gameState, domHud);
            Hud.controller.updateUserInterface();
            let domHud1 = document.getElementById("bosslifeDiv");
            Hud.controller = new fui.Controller(Endabgabe.gameState, domHud1);
            Hud.controller.updateUserInterface();
            let domHud2 = document.getElementById("avatarLifeDiv");
            Hud.controller = new fui.Controller(Endabgabe.gameState, domHud2);
            Hud.controller.updateUserInterface();
        }
    }
    Endabgabe.Hud = Hud;
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=Hud.js.map