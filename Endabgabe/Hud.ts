namespace Endabgabe {
    import fui = FudgeUserInterface;
  
    class GameState extends ƒ.Mutable {
      public weapon: string = "Sword";
      public bosslife: number = 0;
      public avatarLife: number = 100;
      protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
    }
  
    export let gameState: GameState = new GameState();
  
    export class Hud {
      private static controller: fui.Controller;
  
      public static start(): void {
        let domHud: HTMLDivElement = <HTMLDivElement>document.getElementById("Hud");
        Hud.controller = new fui.Controller(gameState, domHud);
        Hud.controller.updateUserInterface();

        let domHud1: HTMLDivElement = <HTMLDivElement>document.getElementById("bosslifeDiv");
        Hud.controller = new fui.Controller(gameState, domHud1);
        Hud.controller.updateUserInterface();

        let domHud2: HTMLDivElement = <HTMLDivElement>document.getElementById("avatarLifeDiv");
        Hud.controller = new fui.Controller(gameState, domHud2);
        Hud.controller.updateUserInterface();
      }
    }
  }