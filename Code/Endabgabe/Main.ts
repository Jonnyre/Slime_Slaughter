// https://github.com/Oneof300/MazeBall
namespace Endabgabe {
    window.addEventListener("load", init);
    import f = FudgeCore;

    export interface IEnemie {
        id: number;
        life: number;
        damage: number;
        bosslifemulitplier: number;
        bossdamagemulitplier: number;
    }

    export enum Game {
        PLAY,
        OVER
    }

    export let state: Game;
    let canvas: HTMLCanvasElement;
    export let root: f.Graph;
    let viewport: f.Viewport;
    export let avatar: Avatar;
    let cmpCamera: f.ComponentCamera;

    let firstPerson: boolean = true;
    let canChangeView: boolean = true;
    let canLavaDamage: boolean = true;

    let camSpeed: number = -0.2;
    let isLocked: boolean = false;
    const jumpForce: number = 400;
    let canAttack: boolean = true;
    let enemies: IEnemie[];
    let levelId: number = 0;
    let trigger: f.Node;
    enum WEAPON {
        BOW = 0,
        SWORD = 1
    }
    let equippedWeapon: WEAPON = WEAPON.SWORD;

    let textureLava: f.TextureImage = new f.TextureImage("./Assets/lava.jpg");
    let mtrLava: f.Material = new f.Material("Lava", f.ShaderTexture, new f.CoatTextured(f.Color.CSS("Red"), textureLava));

    async function init(): Promise<void> {
        let currentLocation: string = window.location.search;
        levelId = Number(currentLocation.replace("?id=", ""));
        console.log(levelId);
        if (levelId == 0)
            levelId = 1;
        await f.Project.loadResourcesFromHTML();
        root = <f.Graph>f.Project.resources["Graph|2021-04-27T14:37:42.239Z|64317"];

        removedUnusedLevel();

        f.Physics.initializePhysics();
        // f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        // f.Physics.settings.debugDraw = true;
        f.Physics.settings.defaultRestitution = 0.5;
        f.Physics.settings.defaultFriction = 0.8;
        canvas = document.querySelector("canvas");
        viewport = new f.Viewport();

        state = Game.PLAY;
        let enemiesJson: Response = await fetch("./Enemies.json");
        enemies = await enemiesJson.json();
        createAvatar();
        createRigidbodies();
        createEnemies();
        createTrigger();

        let restartButton: HTMLDivElement = <HTMLDivElement>document.getElementById("restartLevel");
        restartButton.addEventListener("click", restartLevel);

        let playagain: HTMLDivElement = <HTMLDivElement>document.getElementById("playagain");
        playagain.addEventListener("click", playAgain);

        let levelSelectButton: HTMLDivElement = <HTMLDivElement>document.getElementById("levelSelection");
        levelSelectButton.addEventListener("click", clickLevelSelect);

        let levelSelectButton2: HTMLDivElement = <HTMLDivElement>document.getElementById("levelSelection2");
        levelSelectButton2.addEventListener("click", clickLevelSelect);

        f.Physics.adjustTransforms(root, true);

        viewport.initialize("InteractiveViewport", root, cmpCamera, canvas);
        document.addEventListener("mousemove", hndMouse);
        document.addEventListener("click", onPointerDown);
        document.addEventListener("pointerlockchange", pointerLockChange);

        Hud.start();

        document.addEventListener("keydown", hndKeyDown);
        document.addEventListener("keyup", hndKeyRelease);

        trigger.getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, hndTrigger);

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start();
    }

    function update(): void {
        f.Physics.world.simulate(f.Loop.timeFrameReal / 1000);

        if (state == Game.OVER) return;
        f.AudioManager.default.update();

        switchWeapon();
        avatar.move();
        changeCameraView();
        viewport.draw();
    }

    function createAvatar(): void {
        cmpCamera = new f.ComponentCamera();
        avatar = new Avatar("avatar", cmpCamera);
        gameState.avatarLife = avatar.life;
        avatar.camNode.mtxLocal.rotateY(-90);
        avatar.mtxLocal.translateY(1);
        f.AudioManager.default.listenTo(root);
        f.AudioManager.default.listenWith(avatar.camNode.getComponent(f.ComponentAudioListener));
        let audioBackground: f.Audio = new f.Audio("./Assets/Sounds/Background.mp3");
        let cmpAudio: f.ComponentAudio = new f.ComponentAudio(audioBackground, true);
        cmpAudio.volume = 0.5;
        avatar.addComponent(cmpAudio);
        cmpAudio.play(true);
        root.appendChild(avatar);
    }

    function createRigidbodies(): void {
        let levelParent: f.Node = root.getChildrenByName("level" + levelId)[0];
        let level: f.Node = levelParent.getChildrenByName("level")[0];

        let floor: f.Node = level.getChildrenByName("floor")[0];
        for (let row of floor.getChildren()) {
            for (let piece of row.getChildren()) {
                piece.addComponent(new f.ComponentRigidbody(0, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT));
                if (piece.name === "lava") {
                    let lavaAudio: f.Audio = new f.Audio("./Assets/Sounds/Lava_2.mp3");
                    let cmpAudio: f.ComponentAudio = new f.ComponentAudio(lavaAudio, true);
                    cmpAudio.volume = 0.05;
                    cmpAudio.play(true);
                    piece.addComponent(cmpAudio);
                    piece.removeComponent(piece.getComponent(f.ComponentMaterial));
                    piece.addComponent(new f.ComponentMaterial(mtrLava));
                    piece.getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, hndStepLava);
                }

            }
        }

        let walls: f.Node = level.getChildrenByName("walls")[0];
        for (let wall of walls.getChildren())
            wall.addComponent(new f.ComponentRigidbody(0, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT));
    }

    function hndMouse(_event: MouseEvent): void {
        avatar.camNode.mtxLocal.rotateY(_event.movementX * camSpeed, true);
        let xRotation: number = - _event.movementY * camSpeed;
        if (avatar.camNode.mtxLocal.rotation.x + xRotation > -45 && avatar.camNode.mtxLocal.rotation.x + xRotation < 45)
            avatar.camNode.mtxLocal.rotateX(-_event.movementY * camSpeed);
    }

    function changeCameraView(): void {
        if (!f.Keyboard.isPressedOne([f.KEYBOARD_CODE.Q])) return;

        if (!canChangeView) return;

        if (firstPerson) {
            cmpCamera.mtxPivot.translateY(1);
            cmpCamera.mtxPivot.rotateX(15);
            cmpCamera.mtxPivot.rotateY(0);
            cmpCamera.mtxPivot.translateZ(-6);
        }
        else
            cmpCamera.mtxPivot.set(f.Matrix4x4.TRANSLATION(f.Vector3.Y(0.5)));

        firstPerson = !firstPerson;
        canChangeView = false;
        f.Time.game.setTimer(300, 1, () => canChangeView = true);
    }

    function hndKeyDown(_event: KeyboardEvent): void {
        if (_event.code == f.KEYBOARD_CODE.W)
            avatar.sideMovement = 1;

        if (_event.code == f.KEYBOARD_CODE.A)
            avatar.forwardMovement = 1;

        if (_event.code == f.KEYBOARD_CODE.S)
            avatar.sideMovement = -1;

        if (_event.code == f.KEYBOARD_CODE.D)
            avatar.forwardMovement = -1;

        if (_event.code == f.KEYBOARD_CODE.SPACE) {
            if (avatar.isGrounded) {
                avatar.getComponent(f.ComponentAudio).setAudio(new f.Audio(("./Assets/Sounds/Yeet.mp3")));
                avatar.getComponent(f.ComponentAudio).play(true);
                avatar.getComponent(f.ComponentRigidbody).applyLinearImpulse(new f.Vector3(0, jumpForce, 0));
            }
        }

        if (_event.code == f.KEYBOARD_CODE.SHIFT_LEFT)
            avatar.sprint();
    }

    function hndKeyRelease(_event: KeyboardEvent): void {
        if (_event.code == f.KEYBOARD_CODE.W)
            avatar.sideMovement = 0;

        if (_event.code == f.KEYBOARD_CODE.A)
            avatar.forwardMovement = 0;

        if (_event.code == f.KEYBOARD_CODE.S)
            avatar.sideMovement = 0;

        if (_event.code == f.KEYBOARD_CODE.D)
            avatar.forwardMovement = 0;


        if (_event.code == f.KEYBOARD_CODE.SHIFT_LEFT)
            avatar.walk();
    }

    function switchWeapon(): void {
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ONE])) {
            gameState.weapon = "Sword";
            equippedWeapon = WEAPON.SWORD;

            let crosshairLeft: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair_left");
            crosshairLeft.classList.remove("bow_left");
            crosshairLeft.classList.add("sword_left");

            let crosshairRight: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair_right");
            crosshairRight.classList.remove("bow_right");
            crosshairRight.classList.add("sword_right");

            let crosshairTop: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair_top");
            crosshairTop.classList.remove("bow_top");
            crosshairTop.classList.add("sword_top");

            let crosshairBottom: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair_bottom");
            crosshairBottom.classList.remove("bow_bottom");
            crosshairBottom.classList.add("sword_bottom");
        }


        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.TWO])) {
            gameState.weapon = "Bow";
            equippedWeapon = WEAPON.BOW;
            let crosshairLeft: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair_left");
            crosshairLeft.classList.remove("sword_left");
            crosshairLeft.classList.add("bow_left");

            let crosshairRight: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair_right");
            crosshairRight.classList.remove("sword_right");
            crosshairRight.classList.add("bow_right");

            let crosshairTop: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair_top");
            crosshairTop.classList.remove("sword_top");
            crosshairTop.classList.add("bow_top");

            let crosshairBottom: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair_bottom");
            crosshairBottom.classList.remove("sword_bottom");
            crosshairBottom.classList.add("bow_bottom");
        }
    }

    function pointerLockChange(_event: Event): void {
        if (!document.pointerLockElement)
            isLocked = false;
        else
            isLocked = true;
    }

    function onPointerDown(_event: MouseEvent): void {
        if (!isLocked) {
            canvas.requestPointerLock();
        } else {
            if (!canAttack) return;
            switch (equippedWeapon) {
                case WEAPON.BOW:
                    let arrow: Arrow = new Arrow("Arrow", avatar.getComponent(f.ComponentRigidbody).getPosition(), avatar.camNode.mtxLocal.getZ());
                    arrow.getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, hndCollision);
                    root.addChild(arrow);
                    let direction: f.Vector3 = avatar.camNode.mtxLocal.getZ();
                    direction.scale(4);
                    direction.y += 1;
                    arrow.getComponent(f.ComponentRigidbody).applyLinearImpulse(direction);
                    let arrowAudio: f.Audio = new f.Audio("./Assets/Sounds/Bow.mp3");
                    let cmpAudio: f.ComponentAudio = new f.ComponentAudio(arrowAudio);
                    arrow.addComponent(cmpAudio);
                    cmpAudio.play(true);
                    canAttack = false;
                    f.Time.game.setTimer(500, 1, () => canAttack = true);
                    break;
                case WEAPON.SWORD:
                    let swordAudio: f.Audio = new f.Audio("./Assets/Sounds/Sword_2.mp3");
                    let cmpAudioAvatar: f.ComponentAudio = new f.ComponentAudio(swordAudio);
                    avatar.addComponent(cmpAudioAvatar);
                    cmpAudioAvatar.play(true);
                    let hitInfo: f.RayHitInfo = f.Physics.raycast(avatar.getComponent(f.ComponentRigidbody).getPosition(), avatar.camNode.mtxWorld.getZ(), 4.5);
                    if (hitInfo.hit) {
                        let objectHit: f.Node = hitInfo.rigidbodyComponent.getContainer();
                        if (objectHit.name === "enemie" || objectHit.name === "boss") {
                            attackEnemie(objectHit);
                            canAttack = false;
                            f.Time.game.setTimer(500, 1, () => canAttack = true);
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

    function createEnemies(): void {
        let level: f.Node = root.getChildrenByName("level" + levelId)[0];
        let enemiesNode: f.Node = level.getChildrenByName("enemies")[0];

        for (let enemie of enemiesNode.getChildren()) {
            let enemieComponent: ComponentScriptEnemie = new ComponentScriptEnemie();
            enemie.addComponent(enemieComponent);
            if (enemie.name === "boss") {
                let bossAudio: f.Audio = new f.Audio("./Assets/Sounds/Boss.mp3");
                let cmpAudio: f.ComponentAudio = new f.ComponentAudio(bossAudio, true);
                cmpAudio.volume = 0.5;
                cmpAudio.play(true);
                enemie.addComponent(cmpAudio);

                enemieComponent.enemyProps = {
                    id: enemies[levelId - 1].id,
                    damage: enemies[levelId - 1].damage * enemies[levelId - 1].bossdamagemulitplier,
                    life: enemies[levelId - 1].life * enemies[levelId - 1].bosslifemulitplier,
                    bossdamagemulitplier: enemies[levelId - 1].bossdamagemulitplier,
                    bosslifemulitplier: enemies[levelId - 1].bosslifemulitplier
                };
                gameState.bosslife = enemies[levelId - 1].life * enemies[levelId - 1].bosslifemulitplier;
                let progress: HTMLProgressElement = <HTMLProgressElement>document.getElementById("bosslife");
                progress.max = enemies[levelId - 1].life * enemies[levelId - 1].bosslifemulitplier;
            }
            else
                enemieComponent.enemyProps = {
                    id: enemies[levelId - 1].id,
                    damage: enemies[levelId - 1].damage,
                    life: enemies[levelId - 1].life,
                    bossdamagemulitplier: enemies[levelId - 1].bossdamagemulitplier,
                    bosslifemulitplier: enemies[levelId - 1].bosslifemulitplier
                };
            enemie.addComponent(new f.ComponentRigidbody(0, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT));
        }
    }

    function hndCollision(_event: f.EventPhysics): void {
        let objectHit: f.Node = _event.cmpRigidbody.getContainer();
        if (objectHit.name === "boss" || objectHit.name === "enemie")
            attackEnemie(objectHit);

        if (objectHit.name !== "Avatar") {
            let projectile: Arrow = (<f.ComponentRigidbody>_event.target).getContainer();
            projectile.getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.STATIC;
            f.Time.game.setTimer(1000, 1, () => {
                root.removeChild(projectile);
                if (projectile.getComponent(f.ComponentRigidbody) != undefined)
                    projectile.removeComponent(projectile.getComponent(f.ComponentRigidbody));
                return;
            });
        }
    }

    function attackEnemie(_objectHit: f.Node): void {
        let enemyHitAudio: f.Audio = new f.Audio("./Assets/Sounds/Enemy_Damage.mp3");
        let cmpAudioEnemy: f.ComponentAudio = new f.ComponentAudio(enemyHitAudio);
        _objectHit.addComponent(cmpAudioEnemy);
        cmpAudioEnemy.play(true);
        _objectHit.getComponent(ComponentScriptEnemie).enemyProps.life -= 5;
        if (_objectHit.name == "boss")
            gameState.bosslife = Number(_objectHit.getComponent(ComponentScriptEnemie).enemyProps.life);

        if (_objectHit.getComponent(ComponentScriptEnemie).enemyProps.life <= 0) {
            let enemyDieAudio: f.Audio = new f.Audio("./Assets/Sounds/Enemy_Die.mp3");
            let cmpAudioEnemyDie: f.ComponentAudio = new f.ComponentAudio(enemyDieAudio);
            avatar.addComponent(cmpAudioEnemyDie);
            cmpAudioEnemyDie.play(true);
            let level: f.Node = root.getChildrenByName("level" + levelId)[0];
            let enemiesNode: f.Node = level.getChildrenByName("enemies")[0];
            enemiesNode.removeChild(_objectHit);
            _objectHit.removeComponent(_objectHit.getComponent(f.ComponentRigidbody));
            if (enemiesNode.nChildren == 0)
                win();
        }
    }

    export function gameover(): void {
        state = Game.OVER;

        let gameoverAudio: f.Audio = new f.Audio("./Assets/Sounds/");
        avatar.getComponent(f.ComponentAudio).setAudio(gameoverAudio);
        avatar.getComponent(f.ComponentAudio).play(true);

        let crosshairDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair");
        crosshairDiv.style.display = "none";

        document.exitPointerLock();
        let gameOverDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("gameover");
        gameOverDiv.style.display = "flex";
    }

    async function restartLevel(): Promise<void> {
        let gameOverDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("gameover");
        gameOverDiv.style.display = "none";

        let crosshairDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair");
        crosshairDiv.style.display = "block";
        await init();
    }

    async function playAgain(): Promise<void> {
        let winDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("win");
        winDiv.style.display = "none";

        let crosshairDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair");
        crosshairDiv.style.display = "block";
        await init();
    }

    function clickLevelSelect(): void {
        window.location.href = "./LevelSelect/LevelSelect.html";
    }

    function removedUnusedLevel(): void {
        for (let currentLevel: number = 0; currentLevel < 6; currentLevel++) {
            if (currentLevel != levelId) {
                let level: f.Node = root.getChildrenByName("level" + currentLevel)[0];
                root.removeChild(level);
            }
        }
    }

    function createTrigger(): void {
        trigger = new f.Node("trigger");

        trigger.addComponent(new f.ComponentTransform());
        trigger.mtxLocal.scale(new f.Vector3(140, 1, 30));
        trigger.mtxLocal.translateY(-7.5);

        let body: f.ComponentRigidbody = new f.ComponentRigidbody(0, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.TRIGGER);
        trigger.addComponent(body);

        root.addChild(trigger);
    }

    function hndTrigger(_event: f.EventPhysics): void {
        let objectHit: f.Node = _event.cmpRigidbody.getContainer();
        if (objectHit.name === "avatar") gameover();
    }

    function win(): void {
        state = Game.OVER;

        let crosshairDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("crosshair");
        crosshairDiv.style.display = "none";

        document.exitPointerLock();
        let gameOverDiv: HTMLDivElement = <HTMLDivElement>document.getElementById("win");
        gameOverDiv.style.display = "flex";
    }

    function hndStepLava(_event: f.EventPhysics): void {
        let objectHit: f.Node = _event.cmpRigidbody.getContainer();
        if (objectHit.name === "avatar" && canLavaDamage) {
            canLavaDamage = false;
            let audioHit: f.Audio = new f.Audio("./Assets/Sounds/Ahh(2).mp3");
            let cmpAudioHit: f.ComponentAudio = new f.ComponentAudio(audioHit);
            objectHit.addComponent(cmpAudioHit);
            cmpAudioHit.play(true);
            avatar.life -= 5;
            gameState.avatarLife = avatar.life;
            f.Time.game.setTimer(500, 1, () => canLavaDamage = true);
        }
    }
}
