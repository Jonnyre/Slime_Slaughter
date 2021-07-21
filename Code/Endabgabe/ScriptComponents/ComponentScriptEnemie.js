"use strict";
var Endabgabe;
(function (Endabgabe) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(Endabgabe);
    class ComponentScriptEnemie extends f.ComponentScript {
        constructor() {
            super();
            this.randomFactor = 0;
            f.Time.game.setTimer(500, 1, this.addMtr.bind(this));
            f.Time.game.setTimer(500, 0, this.shoot.bind(this));
        }
        addMtr(_event) {
            let container = this.getContainer();
            container.removeComponent(container.getComponent(f.ComponentMaterial));
            container.addComponent(new f.ComponentMaterial(ComponentScriptEnemie.mtrEnemie));
        }
        shoot() {
            if (this.getContainer().getComponent(f.ComponentRigidbody) == undefined)
                return;
            let container = this.getContainer();
            let direction = f.Vector3.DIFFERENCE(Endabgabe.avatar.getComponent(f.ComponentRigidbody).getPosition(), container.getComponent(f.ComponentRigidbody).getPosition());
            if (direction.magnitude > 25)
                return;
            if (Math.random() > 0.8 - this.randomFactor) {
                this.randomFactor = 0;
                let fireball = new Endabgabe.Fireball("Fireball", container.getComponent(f.ComponentRigidbody).getPosition(), direction);
                fireball.getComponent(f.ComponentRigidbody).addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, this.hndCollision.bind(this));
                Endabgabe.root.addChild(fireball);
                direction.scale(4);
                direction.y += 0.75;
                fireball.getComponent(f.ComponentRigidbody).applyLinearImpulse(direction);
            }
            else
                this.randomFactor += 0.1;
        }
        hndCollision(_event) {
            let objectHit = _event.cmpRigidbody.getContainer();
            if (objectHit.name === "avatar") {
                let audioHit = new f.Audio("./Assets/Sounds/Ahh(2).mp3");
                let cmpAudioHit = new f.ComponentAudio(audioHit);
                objectHit.addComponent(cmpAudioHit);
                cmpAudioHit.play(true);
                Endabgabe.avatar.life -= 5;
                Endabgabe.gameState.avatarLife = Endabgabe.avatar.life;
            }
            if (Endabgabe.avatar.life <= 0) {
                Endabgabe.gameover();
            }
            let fireBall = _event.target.getContainer();
            fireBall.getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.STATIC;
            f.Time.game.setTimer(200, 1, () => {
                Endabgabe.root.removeChild(fireBall);
                if (fireBall.getComponent(f.ComponentRigidbody) != undefined)
                    fireBall.removeComponent(fireBall.getComponent(f.ComponentRigidbody));
                return;
            });
        }
    }
    ComponentScriptEnemie.textureEnemie = new f.TextureImage("./Assets/Slime.png");
    ComponentScriptEnemie.mtrEnemie = new f.Material("Enemie", f.ShaderTexture, new f.CoatTextured(f.Color.CSS("Red"), ComponentScriptEnemie.textureEnemie));
    Endabgabe.ComponentScriptEnemie = ComponentScriptEnemie;
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=ComponentScriptEnemie.js.map