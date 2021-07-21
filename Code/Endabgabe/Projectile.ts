namespace Endabgabe {
    import f = FudgeCore;

    export class Projectile extends f.Node {

        // private static textureArrow: f.TextureImage = new f.TextureImage("./Assets/Arrow_2.png");
        private static mtrArrow: f.Material = new f.Material("Arrow", f.ShaderTexture, new f.CoatTextured(f.Color.CSS("Black")));

        private static textureFireball: f.TextureImage = new f.TextureImage("./Assets/Fireball.jpg");
        private static mtrFireball: f.Material = new f.Material("Arrow", f.ShaderTexture, new f.CoatTextured(f.Color.CSS("White"), Projectile.textureFireball));

        constructor(_name: string, _type: string, _pos: f.Vector3, _direction: f.Vector3) {
            super(_name);
            let meshCube: f.MeshCube = new f.MeshCube();
            let direction: f.Vector3 = _direction;
            direction.normalize(2);
            let position: f.Vector3 = _pos;
            position.add(direction);
            this.addComponent(new f.ComponentTransform(f.Matrix4x4.TRANSLATION(position)));

            let cmpQuad: f.ComponentMesh = new f.ComponentMesh(meshCube);
            this.addComponent(cmpQuad);
            if (_type === "Arrow")
                this.addComponent(new f.ComponentMaterial(Projectile.mtrArrow));
            else
                this.addComponent(new f.ComponentMaterial(Projectile.mtrFireball));

            this.addComponent(new f.ComponentRigidbody(0.2, f.PHYSICS_TYPE.DYNAMIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT));
        }
    }
}