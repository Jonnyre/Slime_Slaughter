"use strict";
var Endabgabe;
(function (Endabgabe) {
    var f = FudgeCore;
    class Arrow extends Endabgabe.Projectile {
        constructor(_name, _characterPos, _characterZ) {
            super(_name, "Arrow", _characterPos, _characterZ);
            this.getComponent(f.ComponentTransform).mtxLocal.scale(new f.Vector3(1, 0.05, 0.05));
            f.Physics.adjustTransforms(this, true);
        }
    }
    Endabgabe.Arrow = Arrow;
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=Arrow.js.map