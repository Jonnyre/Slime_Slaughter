"use strict";
// https://github.com/Oneof300/MazeBall
var Endabgabe;
// https://github.com/Oneof300/MazeBall
(function (Endabgabe) {
    window.addEventListener("load", init);
    var f = FudgeCore;
    let Game;
    (function (Game) {
        Game[Game["PLAY"] = 0] = "PLAY";
        Game[Game["OVER"] = 1] = "OVER";
    })(Game = Endabgabe.Game || (Endabgabe.Game = {}));
    let canvas;
    let viewport;
    let cmpCamera;
    let firstPerson = true;
    let canChangeView = true;
    let canLavaDamage = true;
    let camSpeed = -0.2;
    let isLocked = false;
    const jumpForce = 400;
    let canAttack = true;
    let enemies;
    let levelId = 0;
    let trigger;
    let WEAPON;
    (function (WEAPON) {
        WEAPON[WEAPON["BOW"] = 0] = "BOW";
        WEAPON[WEAPON["SWORD"] = 1] = "SWORD";
    })(WEAPON || (WEAPON = {}));
    let equippedWeapon = WEAPON.SWORD;
    let textureLava = new f.TextureImage("./Assets/lava.jpg");
    let mtrLava = new f.Material("Lava", f.ShaderTexture, new f.CoatTextured(f.Color.CSS("Red"), textureLava));
    async function init() {
        let currentLocation = window.location.search;
        levelId = Number(currentLocation.replace("?id=", ""));
        console.log(levelId);
        if (levelId == 0)
            levelId = 1;
        await f.Project.loadResourcesFromHTML();
        Endabgabe.root = f.Project.resources["Graph|2021-04-27T14:37:42.239Z|64317"];
        removedUnusedLevel();
        f.Physics.initializePhysics();
        // f.Physics.settings.debugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        // f.Physics.settings.debugDraw = true;
        f.Physics.settings.defaultRestitution = 0.5;
        f.Physics.settings.defaultFriction = 0.8;
        canvas = document.querySelector("canvas");
        viewport = new f.Viewport();
        Endabgabe.state = Game.PLAY;
        let enemiesJson = await fetch("./Enemies.json");
        enemies = await enemiesJson.json();
        createAvatar();
        createRigidbodies();
        createEnemies();
        createTrigger();
        let restartButton = document.getElementById("restartLevel");
        restartButton.addEventListener("click", restartLevel);
        let playagain = document.getElementById("playagain");
        playagain.addEventListener("click", playAgain);
        let levelSelectButton = document.getElementById("levelSelection");
        levelSelectButton.addEventListener("click", clickLevelSelect);
        let levelSelectButton2 = document.getElementById("levelSelection2");
        levelSelectButton2.addEventListener("click", clickLevelSelect);
        f.Physics.adjustTransforms(Endabgabe.root, true);
        viewport.initialize("InteractiveViewport", Endabgabe.root, cmpCamera, canvas);
        document.addEventListener("mousemove", hndMouse);
        document.addEventListener("click", onPointerDown);
        document.addEventListener("pointerlockchange", pointerLockChange);
        Endabgabe.Hud.start();
        document.addEventListener("keydown", hndKeyDown);
        document.addEventListener("keyup", hndKeyRelease);
        trigger.getComponent(f.ComponentRigidbody).addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, hndTrigger);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start();
    }
    function update() {
        f.Physics.world.simulate(f.Loop.timeFrameReal / 1000);
        if (Endabgabe.state == Game.OVER)
            return;
        f.AudioManager.default.update();
        switchWeapon();
        Endabgabe.avatar.move();
        changeCameraView();
        viewport.draw();
    }
    function createAvatar() {
        cmpCamera = new f.ComponentCamera();
        Endabgabe.avatar = new Endabgabe.Avatar("avatar", cmpCamera);
        Endabgabe.gameState.avatarLife = Endabgabe.avatar.life;
        Endabgabe.avatar.camNode.mtxLocal.rotateY(-90);
        Endabgabe.avatar.mtxLocal.translateY(1);
        f.AudioManager.default.listenTo(Endabgabe.root);
        f.AudioManager.default.listenWith(Endabgabe.avatar.camNode.getComponent(f.ComponentAudioListener));
        let audioBackground = new f.Audio("./Assets/Sounds/Background.mp3");
        let cmpAudio = new f.ComponentAudio(audioBackground, true);
        cmpAudio.volume = 0.5;
        Endabgabe.avatar.addComponent(cmpAudio);
        cmpAudio.play(true);
        Endabgabe.root.appendChild(Endabgabe.avatar);
    }
    function createRigidbodies() {
        let levelParent = Endabgabe.root.getChildrenByName("level" + levelId)[0];
        let level = levelParent.getChildrenByName("level")[0];
        let floor = level.getChildrenByName("floor")[0];
        for (let row of floor.getChildren()) {
            for (let piece of row.getChildren()) {
                piece.addComponent(new f.ComponentRigidbody(0, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT));
                if (piece.name === "lava") {
                    let lavaAudio = new f.Audio("./Assets/Sounds/Lava_2.mp3");
                    let cmpAudio = new f.ComponentAudio(lavaAudio, true);
                    cmpAudio.volume = 0.05;
                    cmpAudio.play(true);
                    piece.addComponent(cmpAudio);
                    piece.removeComponent(piece.getComponent(f.ComponentMaterial));
                    piece.addComponent(new f.ComponentMaterial(mtrLava));
                    piece.getComponent(f.ComponentRigidbody).addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, hndStepLava);
                }
            }
        }
        let walls = level.getChildrenByName("walls")[0];
        for (let wall of walls.getChildren())
            wall.addComponent(new f.ComponentRigidbody(0, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.DEFAULT));
    }
    function hndMouse(_event) {
        Endabgabe.avatar.camNode.mtxLocal.rotateY(_event.movementX * camSpeed, true);
        let xRotation = -_event.movementY * camSpeed;
        if (Endabgabe.avatar.camNode.mtxLocal.rotation.x + xRotation > -45 && Endabgabe.avatar.camNode.mtxLocal.rotation.x + xRotation < 45)
            Endabgabe.avatar.camNode.mtxLocal.rotateX(-_event.movementY * camSpeed);
    }
    function changeCameraView() {
        if (!f.Keyboard.isPressedOne([f.KEYBOARD_CODE.Q]))
            return;
        if (!canChangeView)
            return;
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
    function hndKeyDown(_event) {
        if (_event.code == f.KEYBOARD_CODE.W)
            Endabgabe.avatar.sideMovement = 1;
        if (_event.code == f.KEYBOARD_CODE.A)
            Endabgabe.avatar.forwardMovement = 1;
        if (_event.code == f.KEYBOARD_CODE.S)
            Endabgabe.avatar.sideMovement = -1;
        if (_event.code == f.KEYBOARD_CODE.D)
            Endabgabe.avatar.forwardMovement = -1;
        if (_event.code == f.KEYBOARD_CODE.SPACE) {
            if (Endabgabe.avatar.isGrounded) {
                Endabgabe.avatar.getComponent(f.ComponentAudio).setAudio(new f.Audio(("./Assets/Sounds/Yeet.mp3")));
                Endabgabe.avatar.getComponent(f.ComponentAudio).play(true);
                Endabgabe.avatar.getComponent(f.ComponentRigidbody).applyLinearImpulse(new f.Vector3(0, jumpForce, 0));
            }
        }
        if (_event.code == f.KEYBOARD_CODE.SHIFT_LEFT)
            Endabgabe.avatar.sprint();
    }
    function hndKeyRelease(_event) {
        if (_event.code == f.KEYBOARD_CODE.W)
            Endabgabe.avatar.sideMovement = 0;
        if (_event.code == f.KEYBOARD_CODE.A)
            Endabgabe.avatar.forwardMovement = 0;
        if (_event.code == f.KEYBOARD_CODE.S)
            Endabgabe.avatar.sideMovement = 0;
        if (_event.code == f.KEYBOARD_CODE.D)
            Endabgabe.avatar.forwardMovement = 0;
        if (_event.code == f.KEYBOARD_CODE.SHIFT_LEFT)
            Endabgabe.avatar.walk();
    }
    function switchWeapon() {
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ONE])) {
            Endabgabe.gameState.weapon = "Sword";
            equippedWeapon = WEAPON.SWORD;
            let crosshairLeft = document.getElementById("crosshair_left");
            crosshairLeft.classList.remove("bow_left");
            crosshairLeft.classList.add("sword_left");
            let crosshairRight = document.getElementById("crosshair_right");
            crosshairRight.classList.remove("bow_right");
            crosshairRight.classList.add("sword_right");
            let crosshairTop = document.getElementById("crosshair_top");
            crosshairTop.classList.remove("bow_top");
            crosshairTop.classList.add("sword_top");
            let crosshairBottom = document.getElementById("crosshair_bottom");
            crosshairBottom.classList.remove("bow_bottom");
            crosshairBottom.classList.add("sword_bottom");
        }
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.TWO])) {
            Endabgabe.gameState.weapon = "Bow";
            equippedWeapon = WEAPON.BOW;
            let crosshairLeft = document.getElementById("crosshair_left");
            crosshairLeft.classList.remove("sword_left");
            crosshairLeft.classList.add("bow_left");
            let crosshairRight = document.getElementById("crosshair_right");
            crosshairRight.classList.remove("sword_right");
            crosshairRight.classList.add("bow_right");
            let crosshairTop = document.getElementById("crosshair_top");
            crosshairTop.classList.remove("sword_top");
            crosshairTop.classList.add("bow_top");
            let crosshairBottom = document.getElementById("crosshair_bottom");
            crosshairBottom.classList.remove("sword_bottom");
            crosshairBottom.classList.add("bow_bottom");
        }
    }
    function pointerLockChange(_event) {
        if (!document.pointerLockElement)
            isLocked = false;
        else
            isLocked = true;
    }
    function onPointerDown(_event) {
        if (!isLocked) {
            canvas.requestPointerLock();
        }
        else {
            if (!canAttack)
                return;
            switch (equippedWeapon) {
                case WEAPON.BOW:
                    let arrow = new Endabgabe.Arrow("Arrow", Endabgabe.avatar.getComponent(f.ComponentRigidbody).getPosition(), Endabgabe.avatar.camNode.mtxLocal.getZ());
                    arrow.getComponent(f.ComponentRigidbody).addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, hndCollision);
                    Endabgabe.root.addChild(arrow);
                    let direction = Endabgabe.avatar.camNode.mtxLocal.getZ();
                    direction.scale(4);
                    direction.y += 1;
                    arrow.getComponent(f.ComponentRigidbody).applyLinearImpulse(direction);
                    let arrowAudio = new f.Audio("./Assets/Sounds/Bow.mp3");
                    let cmpAudio = new f.ComponentAudio(arrowAudio);
                    arrow.addComponent(cmpAudio);
                    cmpAudio.play(true);
                    canAttack = false;
                    f.Time.game.setTimer(500, 1, () => canAttack = true);
                    break;
                case WEAPON.SWORD:
                    let swordAudio = new f.Audio("./Assets/Sounds/Sword_2.mp3");
                    let cmpAudioAvatar = new f.ComponentAudio(swordAudio);
                    Endabgabe.avatar.addComponent(cmpAudioAvatar);
                    cmpAudioAvatar.play(true);
                    let hitInfo = f.Physics.raycast(Endabgabe.avatar.getComponent(f.ComponentRigidbody).getPosition(), Endabgabe.avatar.camNode.mtxWorld.getZ(), 4.5);
                    if (hitInfo.hit) {
                        let objectHit = hitInfo.rigidbodyComponent.getContainer();
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
    function createEnemies() {
        let level = Endabgabe.root.getChildrenByName("level" + levelId)[0];
        let enemiesNode = level.getChildrenByName("enemies")[0];
        for (let enemie of enemiesNode.getChildren()) {
            let enemieComponent = new Endabgabe.ComponentScriptEnemie();
            enemie.addComponent(enemieComponent);
            if (enemie.name === "boss") {
                let bossAudio = new f.Audio("./Assets/Sounds/Boss.mp3");
                let cmpAudio = new f.ComponentAudio(bossAudio, true);
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
                Endabgabe.gameState.bosslife = enemies[levelId - 1].life * enemies[levelId - 1].bosslifemulitplier;
                let progress = document.getElementById("bosslife");
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
    function hndCollision(_event) {
        let objectHit = _event.cmpRigidbody.getContainer();
        if (objectHit.name === "boss" || objectHit.name === "enemie")
            attackEnemie(objectHit);
        if (objectHit.name !== "Avatar") {
            let projectile = _event.target.getContainer();
            projectile.getComponent(f.ComponentRigidbody).physicsType = f.PHYSICS_TYPE.STATIC;
            f.Time.game.setTimer(1000, 1, () => {
                Endabgabe.root.removeChild(projectile);
                if (projectile.getComponent(f.ComponentRigidbody) != undefined)
                    projectile.removeComponent(projectile.getComponent(f.ComponentRigidbody));
                return;
            });
        }
    }
    function attackEnemie(_objectHit) {
        let enemyHitAudio = new f.Audio("./Assets/Sounds/Enemy_Damage.mp3");
        let cmpAudioEnemy = new f.ComponentAudio(enemyHitAudio);
        _objectHit.addComponent(cmpAudioEnemy);
        cmpAudioEnemy.play(true);
        _objectHit.getComponent(Endabgabe.ComponentScriptEnemie).enemyProps.life -= 5;
        if (_objectHit.name == "boss")
            Endabgabe.gameState.bosslife = Number(_objectHit.getComponent(Endabgabe.ComponentScriptEnemie).enemyProps.life);
        if (_objectHit.getComponent(Endabgabe.ComponentScriptEnemie).enemyProps.life <= 0) {
            let enemyDieAudio = new f.Audio("./Assets/Sounds/Enemy_Die.mp3");
            let cmpAudioEnemyDie = new f.ComponentAudio(enemyDieAudio);
            Endabgabe.avatar.addComponent(cmpAudioEnemyDie);
            cmpAudioEnemyDie.play(true);
            let level = Endabgabe.root.getChildrenByName("level" + levelId)[0];
            let enemiesNode = level.getChildrenByName("enemies")[0];
            enemiesNode.removeChild(_objectHit);
            _objectHit.removeComponent(_objectHit.getComponent(f.ComponentRigidbody));
            if (enemiesNode.nChildren == 0)
                win();
        }
    }
    function gameover() {
        Endabgabe.state = Game.OVER;
        let gameoverAudio = new f.Audio("./Assets/Sounds/");
        Endabgabe.avatar.getComponent(f.ComponentAudio).setAudio(gameoverAudio);
        Endabgabe.avatar.getComponent(f.ComponentAudio).play(true);
        let crosshairDiv = document.getElementById("crosshair");
        crosshairDiv.style.display = "none";
        document.exitPointerLock();
        let gameOverDiv = document.getElementById("gameover");
        gameOverDiv.style.display = "flex";
    }
    Endabgabe.gameover = gameover;
    async function restartLevel() {
        let gameOverDiv = document.getElementById("gameover");
        gameOverDiv.style.display = "none";
        let crosshairDiv = document.getElementById("crosshair");
        crosshairDiv.style.display = "block";
        await init();
    }
    async function playAgain() {
        let winDiv = document.getElementById("win");
        winDiv.style.display = "none";
        let crosshairDiv = document.getElementById("crosshair");
        crosshairDiv.style.display = "block";
        await init();
    }
    function clickLevelSelect() {
        window.location.href = "./LevelSelect/LevelSelect.html";
    }
    function removedUnusedLevel() {
        for (let currentLevel = 0; currentLevel < 6; currentLevel++) {
            if (currentLevel != levelId) {
                let level = Endabgabe.root.getChildrenByName("level" + currentLevel)[0];
                Endabgabe.root.removeChild(level);
            }
        }
    }
    function createTrigger() {
        trigger = new f.Node("trigger");
        trigger.addComponent(new f.ComponentTransform());
        trigger.mtxLocal.scale(new f.Vector3(140, 1, 30));
        trigger.mtxLocal.translateY(-7.5);
        let body = new f.ComponentRigidbody(0, f.PHYSICS_TYPE.STATIC, f.COLLIDER_TYPE.CUBE, f.PHYSICS_GROUP.TRIGGER);
        trigger.addComponent(body);
        Endabgabe.root.addChild(trigger);
    }
    function hndTrigger(_event) {
        let objectHit = _event.cmpRigidbody.getContainer();
        if (objectHit.name === "avatar")
            gameover();
    }
    function win() {
        Endabgabe.state = Game.OVER;
        let crosshairDiv = document.getElementById("crosshair");
        crosshairDiv.style.display = "none";
        document.exitPointerLock();
        let gameOverDiv = document.getElementById("win");
        gameOverDiv.style.display = "flex";
    }
    function hndStepLava(_event) {
        let objectHit = _event.cmpRigidbody.getContainer();
        if (objectHit.name === "avatar" && canLavaDamage) {
            canLavaDamage = false;
            let audioHit = new f.Audio("./Assets/Sounds/Ahh(2).mp3");
            let cmpAudioHit = new f.ComponentAudio(audioHit);
            objectHit.addComponent(cmpAudioHit);
            cmpAudioHit.play(true);
            Endabgabe.avatar.life -= 5;
            Endabgabe.gameState.avatarLife = Endabgabe.avatar.life;
            f.Time.game.setTimer(500, 1, () => canLavaDamage = true);
        }
    }
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=Main.js.map