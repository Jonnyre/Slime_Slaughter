"use strict";
var Endabgabe;
(function (Endabgabe) {
    var f = FudgeCore;
    class Projectile extends f.Node {
        constructor(_name, _type, _pos, _direction) {
            super(_name);
            let meshCube = new f.MeshCube();
            let direction = _direction;
            direction.normalize(2);
            let position = _pos;
            position.add(direction);
            this.addComponent(new f.ComponentTransform(f.Matrix4x4.TRANSLATION(position)));
            let cmpQuad = new f.ComponentMesh(meshCube);
            this.addComponent(cmpQuad);
            if (_type === "Arrow")
                this.addComponent(new f.ComponentMaterial(Projectile.mtrArrow));
            else
                this.addComponent(new f.ComponentMaterial(Projectile.mtrFireball));
            this.addComponent(new f.ComponentRigidbody(0.2, f.PHYSICS_TYPE.DYNAMIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT));
        }
    }
    // private static textureArrow: f.TextureImage = new f.TextureImage("./Assets/Arrow_2.png");
    Projectile.mtrArrow = new f.Material("Arrow", f.ShaderTexture, new f.CoatTextured(f.Color.CSS("Black")));
    Projectile.textureFireball = new f.TextureImage("./Assets/Fireball.jpg");
    Projectile.mtrFireball = new f.Material("Arrow", f.ShaderTexture, new f.CoatTextured(f.Color.CSS("White"), Projectile.textureFireball));
    Endabgabe.Projectile = Projectile;
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=Projectile.js.map