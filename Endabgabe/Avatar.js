"use strict";
var Endabgabe;
(function (Endabgabe) {
    var f = FudgeCore;
    class Avatar extends f.Node {
        constructor(_name, _cmpCamera) {
            super(_name);
            this.camNode = new f.Node("Cam");
            this.movementSpeed = 5;
            this.forwardMovement = 0;
            this.sideMovement = 0;
            this.defaultMovementSpeed = 5;
            this.life = 100;
            let cmpTransform = new f.ComponentTransform(f.Matrix4x4.IDENTITY());
            this.addComponent(cmpTransform);
            this.addChild(this.camNode);
            this.cmpCamera = _cmpCamera;
            this.cmpCamera.projectCentral(1, 90, f.FIELD_OF_VIEW.DIAGONAL, 0.2, 2000);
            this.cmpCamera.clrBackground = f.Color.CSS("SlateGrey");
            let cmpCamTransform = new f.ComponentTransform();
            this.camNode.addComponent(cmpCamTransform);
            this.camNode.addComponent(this.cmpCamera);
            let avatarBody = new f.ComponentRigidbody(75, f.PHYSICS_TYPE.DYNAMIC, f.COLLIDER_TYPE.CAPSULE, f.PHYSICS_GROUP.DEFAULT);
            avatarBody.friction = 0.01;
            avatarBody.restitution = 0;
            avatarBody.rotationInfluenceFactor = f.Vector3.ZERO();
            let cmpAudio = new f.ComponentAudio();
            this.addComponent(cmpAudio);
            this.camNode.addComponent(new f.ComponentAudioListener());
            this.addComponent(avatarBody);
        }
        move() {
            this.checkIfGrounded();
            let playerForward = this.camNode.mtxLocal.getX();
            let playerSideward = this.camNode.mtxLocal.getZ();
            playerSideward.normalize();
            playerForward.normalize();
            let movementVel = new f.Vector3();
            movementVel.z = (playerForward.z * this.forwardMovement + playerSideward.z * this.sideMovement) * this.movementSpeed;
            movementVel.y = this.getComponent(f.ComponentRigidbody).getVelocity().y;
            movementVel.x = (playerForward.x * this.forwardMovement + playerSideward.x * this.sideMovement) * this.movementSpeed;
            this.getComponent(f.ComponentRigidbody).setVelocity(movementVel);
        }
        checkIfGrounded() {
            let hitInfo;
            hitInfo = f.Physics.raycast(this.getComponent(f.ComponentRigidbody).getPosition(), new f.Vector3(0, -1, 0), 1.1);
            this.isGrounded = hitInfo.hit;
        }
        sprint() {
            if (this.movementSpeed != 8)
                this.movementSpeed = 8;
        }
        walk() {
            this.movementSpeed = this.defaultMovementSpeed;
        }
    }
    Endabgabe.Avatar = Avatar;
})(Endabgabe || (Endabgabe = {}));
//# sourceMappingURL=Avatar.js.map