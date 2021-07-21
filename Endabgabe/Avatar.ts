namespace Endabgabe {
    import f = FudgeCore;

    export class Avatar extends f.Node {
        public cmpCamera: f.ComponentCamera;
        public camNode: f.Node = new f.Node("Cam");
        public movementSpeed: number = 5;
        public forwardMovement: number = 0;
        public sideMovement: number = 0;
        public isGrounded: boolean;
        public isInRange: boolean;
        public life: number;

        private defaultMovementSpeed: number = 5;
        constructor(_name: string, _cmpCamera: f.ComponentCamera) {
            super(_name);
            this.life = 100;
            let cmpTransform: f.ComponentTransform = new f.ComponentTransform(f.Matrix4x4.IDENTITY());
            this.addComponent(cmpTransform);

            this.addChild(this.camNode);
            this.cmpCamera = _cmpCamera;
            this.cmpCamera.projectCentral(1, 90, f.FIELD_OF_VIEW.DIAGONAL, 0.2, 2000);
            this.cmpCamera.clrBackground = f.Color.CSS("SlateGrey");
            let cmpCamTransform: f.ComponentTransform = new f.ComponentTransform();
            this.camNode.addComponent(cmpCamTransform);
            this.camNode.addComponent(this.cmpCamera);

            let avatarBody: f.ComponentRigidbody = new f.ComponentRigidbody(75, f.PHYSICS_TYPE.DYNAMIC, f.COLLIDER_TYPE.CAPSULE, f.PHYSICS_GROUP.DEFAULT);
            avatarBody.friction = 0.01;
            avatarBody.restitution = 0;
            avatarBody.rotationInfluenceFactor = f.Vector3.ZERO();

            let cmpAudio: f.ComponentAudio = new f.ComponentAudio();
            this.addComponent(cmpAudio);
            this.camNode.addComponent(new f.ComponentAudioListener());

            this.addComponent(avatarBody);
        }

        public move(): void {
            this.checkIfGrounded();
            let playerForward: f.Vector3 = this.camNode.mtxLocal.getX();
            let playerSideward: f.Vector3 = this.camNode.mtxLocal.getZ();
            playerSideward.normalize();
            playerForward.normalize();
            let movementVel: f.Vector3 = new f.Vector3();
            movementVel.z = (playerForward.z * this.forwardMovement + playerSideward.z * this.sideMovement) * this.movementSpeed;
            movementVel.y = this.getComponent(f.ComponentRigidbody).getVelocity().y;
            movementVel.x = (playerForward.x * this.forwardMovement + playerSideward.x * this.sideMovement) * this.movementSpeed;
            this.getComponent(f.ComponentRigidbody).setVelocity(movementVel);
        }

        public checkIfGrounded(): void {
            let hitInfo: f.RayHitInfo;
            hitInfo = f.Physics.raycast(this.getComponent(f.ComponentRigidbody).getPosition(), new f.Vector3(0, -1, 0), 1.1);
            this.isGrounded = hitInfo.hit;
        }

        public sprint(): void {
            if (this.movementSpeed != 8) this.movementSpeed = 8;
        }

        public walk(): void {
            this.movementSpeed = this.defaultMovementSpeed;
        }
    }
}