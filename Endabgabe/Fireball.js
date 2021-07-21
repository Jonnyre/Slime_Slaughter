"use strict";
var Endabgabe;
(function (Endabgabe) {
    var f = FudgeCore;
    class Fireball extends Endabgabe.Projectile {
        constructor(_name, _characterPos, _characterZ) {
            super(_name, "Fireball", _characterPos, _characterZ);
            this.getComponent(f.ComponentTransform).mtxLocal.scale(new f.Vector3(0.1, 0.25, 0.25));
            f.Physics.adjustTransforms(this, true);
        }
    }
    Endabgabe.Fireball = Fireball;
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=Fireball.js.map