namespace Endabgabe {
    import f = FudgeCore;

    export class Arrow extends Projectile {

        constructor(_name: string, _characterPos: f.Vector3, _characterZ: f.Vector3) {
            super(_name, "Arrow", _characterPos, _characterZ);
            this.getComponent(f.ComponentTransform).mtxLocal.scale(new f.Vector3(1, 0.05, 0.05));

            f.Physics.adjustTransforms(this, true);
        }
    }
}