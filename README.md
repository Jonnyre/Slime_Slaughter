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
|  1 | Nutzerinteraktion     | Der Nutzer kann mit der Applikation interagieren. Mit welchen Mitteln und welchen Aktionen werden welche Reaktionen ausgelöst?                                                                                                                                                 |
|  2 | Objektinteraktion     | - Kollision Projektile mit Level\  - Kollision Projektile mit Gegner/Avatar\  - Kollision Avatar Lava Feld\  - Trigger beim Herunterfallen vom Level\  - Raycast Sprung Avatar sowie Schlag Schwert                                                                           |
|  3 | Objektanzahl variabel | - Feuerbälle sowie Pfeile werden zur Laufzeit erstellt und variieren dadurch ständig in der
Anzahl                                                                                                                                                                       |
|  4 | Szenenhierarchie      | Die Szenenhierarchie ist sinnvoll aufgebaut. Wer ist wessen Parent, wie sind Elemente in anderen gruppiert und warum?                                                                                                                                                         |
|  5 | Sound                 | - Avatar bekommt Schaden
                               - Hintergrundmusik
                               - Bossgeräusch
                               - Bogenschuss
                               - Gegner bekommt Schaden
                               - Gegner stirbt
                               - Lavablubbern
                               - Schwertgeräusch
                               - Springen 
                                          |
|  6 | GUI                   | - Boss Lebensanzeige
                               - Avatar Lebensanzeige
                               - Ausgerüstete Waffe
                               - Crosshair                                                                                    |
|  7 | Externe Daten         | Root wird aus JSON geladen
 Parameter für Gegner in JSON gespeichert                                                                                   |
|  8 | Verhaltensklassen     | Das Verhalten von Objekten ist in den Methoden von Klassen definiert, die in externen Dateien abgelegt sind. Welche Klassen sind dies und welches Verhalten wird dort beschrieben?                                                                                         |
|  9 | Subklassen            | Projectile:
                               - Arrow
                               - Fireball 
 |
| 10 | Maße & Positionen     | - Avatar & Gegner (1,1,1)
                               - Boss (3,4,3)
                               - Level (66,0.5,9)
                               - Bodenstück (3,1,1)
                               Positionen:
                               - Ursprung: Startpunkt Avatar
                               - Gegnerposition variiert je nach Level                                                                                                       |
| 11 | Event-System          | Physik:
                               - COLLISION_ENTER
                               - TRIGGER_ENTER
                               Weitere:
                               - Load
                               - Click
                               - Mousemove
                               - Pointerlockchange
                               - Keydown
                               - keyup                                                                                                                                       |
