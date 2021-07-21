namespace Endabgabe {
    import f = FudgeCore;
    f.Project.registerScriptNamespace(Endabgabe);

    export class ComponentScriptEnemie extends f.ComponentScript {
        private static textureEnemie: f.TextureImage = new f.TextureImage("./Assets/Slime.png");
        private static mtrEnemie: f.Material = new f.Material("Enemie", f.ShaderTexture, new f.CoatTextured(f.Color.CSS("Red"), ComponentScriptEnemie.textureEnemie));


        public enemyProps: IEnemie;

        private randomFactor: number = 0;

        constructor() {
            super();
            f.Time.game.setTimer(500, 1, this.addMtr.bind(this));
            f.Time.game.setTimer(500, 0, this.shoot.bind(this));
        }

        private addMtr(_event: CustomEvent): void {
            let container: f.Node = this.getContainer();
            container.removeComponent(container.getComponent(f.ComponentMaterial));
            container.addComponent(new f.ComponentMaterial(ComponentScriptEnemie.mtrEnemie));
        }

        private shoot(): void {
            if (this.getContainer().getComponent(f.ComponentRigidbody) == undefined)
                return;

            let container: f.Node = this.getContainer();
            let direction: f.Vector3 = f.Vector3.DIFFERENCE(avatar.getComponent(f.ComponentRigidbody).getPosition(), container.getComponent(f.ComponentRigidbody).getPosition());

            if (direction.magnitude > 25) return;

            if (Math.random() > 0.8 - this.randomFactor) {
                this.randomFactor = 0;


                let fireball: Fireball = new Fireball("Fireball", container.getComponent(f.ComponentRigidbody).getPosition(), direction);
                fireball.getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, this.hndCollision.bind(this));
                root.addChild(fireball);

                direction.scale(4);
                direction.y += 0.75;
                fireball.getComponent(f.ComponentRigidbody).applyLinearImpulse(direction);
            }
            else
                this.randomFactor += 0.1;
        }

        private hndCollision(_event: f.EventPhysics): void {
            let objectHit: f.Node = _event.cmpRigidbody.getContainer();
            if (objectHit.name === "avatar") {
                let audioHit: f.Audio = new f.Audio("./Assets/Sounds/Ahh(2).mp3");
                let cmpAudioHit: f.ComponentAudio = new f.ComponentAudio(audioHit);
                objectHit.addComponent(cmpAudioHit);
                cmpAudioHit.play(true);
                avatar.life -= 5;
                gameState.avatarLife = avatar.life;
            }
            if (avatar.life <= 0) {
                gameover();
            }

            let fireBall: Fireball = (<f.ComponentRigidbody>_event.target).getContainer();
            fireBall.getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.STATIC;
            f.Time.game.setTimer(200, 1, () => {
                root.removeChild(fireBall);
                if (fireBall.getComponent(f.ComponentRigidbody) != undefined)
                    fireBall.removeComponent(fireBall.getComponent(f.ComponentRigidbody));
                return;
            });
        }
    }
}