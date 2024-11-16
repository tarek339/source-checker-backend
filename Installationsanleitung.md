# Installationsanleitung Quellenchecker

## Schritt 1: Projekt herunterladen

1. Klonen oder laden Sie das Projekt von der Repository-URL herunter.

## Schritt 2: Terminal öffnen

1. Öffnen Sie das Terminal.
2. Navigieren Sie zum Projektverzeichnis mit folgendem Befehl:
   ```
   cd /Pfad/zum/Projekt
   ```

## Entwicklungsmodus

1. Installieren Sie die erforderlichen Abhängigkeiten:
    ``` 
    npm install
    ```
2. Starten Sie den Entwicklungsserver:
    ```
    npm run dev
    ```
3. Erstellen Sie eine .env-Datei im Root-Verzeichnis des Projekts.
4. Fügen Sie die folgenden Variablen und deren Werte hinzu:
    ```
    PORT=4000
    DB_CONNECT="Verbindung zur Datenbank"
    WEB_SERVER_URL=http://localhost:5173
    ROOT_TO_DIRECTORY=/Pfad/zum/Ordner (zum Speichern der Screenshots)
    ```
## Produktionsmodus

Um das Projekt für die Produktion zu erstellen und zu starten, folgen Sie diesen Schritten:

1. Erstellen Sie die Produktionsversion:
    ```
    npm run build
    ```
2. Navigieren Sie in das dist-Verzeichnis:
    ```
    cd dist
    ```
3. Starten Sie das Produktions-Server:
    ```
    npm start
    ```
    
## Hinweis

Stellen Sie sicher, dass Sie Node.js und npm installiert haben, um die oben genannten Befehle ausführen zu können. Weitere Informationen finden Sie in der offiziellen [Node.js-Dokumentation](https://nodejs.org/en/).