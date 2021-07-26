# Slime_Slaughter

- Zum Spiel: [Slime_Slaughter](https://jonnyre.github.io/Slime_Slaughter/Code/Endabgabe/LevelSelect/LevelSelect.html)<br/>
- Zu den Code-Files: [Code Files-Folder](https://github.com/Jonnyre/Slime_Slaughter/tree/main/Code)<br/>
- Designdokument: [Zum Dokument](https://github.com/Jonnyre/Slime_Slaughter/blob/main/Designdokument.pdf)<br/>
- Zip-Download [hier](https://github.com/Jonnyre/Slime_Slaughter/blob/main/Slime_Slaughter.zip)
- Das Projekt muss lediglich mittels Live-Server ausgeführt werden. Die auszuführende html ist die Endabgabe/LevelSelect/LevelSelect.html.

Abgabe wurde mit Fudge erstellt im Rahmen des WPM Prototyping interaktiver Medien-Apps und Games der Hochschule Furtwangen.<br/>
Zum Repo des WPMs: [PRIMA](https://github.com/JirkaDellOro/Prima)

## Checkliste für Leistungsnachweis
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU

| Nr | Bezeichnung           | Inhalt                                                                                                                                                                                                                                                                         |
|---:|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|    | Titel                 | Slime Slaughter
|    | Name                  | Jonathan Rißler
|    | Matrikelnummer        | 263246
|  1 | Nutzerinteraktion     | - WASD: Steuerung <br> - Space: Jump <br> - Shift: Sprint <br> - 1/2 Wechsel Schwert/Bogen <br> - Linke Maustaste: Angriff mit Waffe  |
|  2 | Objektinteraktion     | - Kollision Projektile mit Level <br> - Kollision Projektile mit Gegner/Avatar <br> - Kollision Avatar Lava Feld <br> - Trigger beim Herunterfallen vom Level <br> - Raycast Sprung Avatar sowie Schlag Schwert<br>  |
|  3 | Objektanzahl variabel | - Feuerbälle sowie Pfeile werden zur Laufzeit erstellt und variieren dadurch ständig in der Anzahl  |
|  4 | Szenenhierarchie      | root <br> - trigger <br> - projectiles <br> - avatar <br> ----> camNode <br> - level1-5 <br> ----> level <br> -------> floor <br> ----------> row1-23 <br> -------------> piece1-10/lava -------> walls <br> ----------> row1-23|
|  5 | Sound                 | - Avatar bekommt Schaden <br> - Hintergrundmusik <br> - Bossgeräusch <br> - Bogenschuss <br> - Gegner bekommt Schaden <br> - Gegner stirbt <br> - Lavablubbern <br> - Schwertgeräusch <br> - Springen  |
|  6 | GUI                   | - Boss Lebensanzeige <br> - Avatar Lebensanzeige <br> - Ausgerüstete Waffe <br> - Crosshair  |
|  7 | Externe Daten         | - Root wird aus JSON geladen <br> - Parameter für Gegner in JSON gespeichert  |
|  8 | Verhaltensklassen     | - Hud <br> - Projectile <br> -> Arrow <br> -> Fireball <br> - Avatar <br> - ComponentScriptEnemie  |
|  9 | Subklassen            | Projectile: <br> - Arrow <br> - Fireball  |
| 10 | Maße & Positionen     | - Avatar & Gegner (1,1,1) <br> - Boss (3,4,3) <br> - Level (66,0.5,9) <br> - Bodenstück (3,1,1) <br> Positionen: <br> - Ursprung: Startpunkt Avatar <br> - Gegnerposition variiert je nach Level  |
| 11 | Event-System          | Physik: <br> - COLLISION_ENTER <br> - TRIGGER_ENTER <br> Weitere: <br> - Load <br> - Click <br> - Mousemove <br> - Pointerlockchange <br> - Keydown <br> - keyup  |
