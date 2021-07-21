namespace Endabgabe {
    import f = FudgeCore;

    export class Fireball extends Projectile {

        constructor(_name: string, _characterPos: f.Vector3, _characterZ: f.Vector3) {
            super(_name, "Fireball", _characterPos, _characterZ);
            this.getComponent(f.ComponentTransform).mtxLocal.scale(new f.Vector3(0.1, 0.25, 0.25));

            f.Physics.adjustTransforms(this, true);
        }
    }
}