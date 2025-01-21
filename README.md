## Application Details

|     |
| --- |

<<<<<<< HEAD
|**Generation Date and Time**<br>Wed Jan 08 2025 18:53:16 GMT+0100 (Ora standard dell’Europa centrale)|
=======
|**Generation Date and Time**<br>Wed Jan 08 2025 15:16:28 GMT+0100 (Ora standard dell’Europa centrale)|

> > > > > > > e2c56b404ca58bcb2de58ba6ddc0bd7587eca228
> > > > > > > |**App Generator**<br>@sap/generator-fiori-freestyle|
> > > > > > > |**App Generator Version**<br>1.9.6|
> > > > > > > |**Generation Platform**<br>Visual Studio Code|
> > > > > > > |**Template Used**<br>simple|
> > > > > > > |**Service Type**<br>None|
> > > > > > > |**Service URL**<br>N/A
> > > > > > > <<<<<<< HEAD

# |**Module Name**<br>rheinmetal-assd|

|**Module Name**<br>rheinmetall-assd|

> > > > > > > e2c56b404ca58bcb2de58ba6ddc0bd7587eca228
> > > > > > > |**Application Title**<br>ASSD|
> > > > > > > |**Namespace**<br>|
> > > > > > > |**UI5 Theme**<br>sap_horizon|
> > > > > > > |**UI5 Version**<br>1.131.1|
> > > > > > > |**Enable Code Assist Libraries**<br>False|
> > > > > > > |**Enable TypeScript**<br>False|
> > > > > > > |**Add Eslint configuration**<br>False|

<<<<<<< HEAD

## rheinmetal-assd

=======

## rheinmetall-assd

> > > > > > > e2c56b404ca58bcb2de58ba6ddc0bd7587eca228

A Fiori application.

### Starting the generated app

- This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite. In order to launch the generated app, simply run the following from the generated app root folder:

```
    npm start
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version. (See https://nodejs.org)

# Rheinmetall ASSD

Programma per la lettura dell'anagrafica e la visualizzazione delle notifiche di servizio

## Descrizione

il programma dopo aver effettuato l'accesso tramite la login si compone di una pagina in split screen, dove a sinistra si trova la navigazione per le due pagine, una è l'anagrafica, dove viene visualizzata l'anagrafica dell'utente loggato, mentre l'altra è la service notification. La parte di destra si visualizzano le pagine precedentemente esposte.

## Installazione

Clonare il repository da GitHub;
Naviga nella cartella dove vuoi clonare il repository, poi, clona il repo tramite il comando git clone seguito dall'url del repository:
git clone https://github.com/CUBE-CONSULTANTS/Rheinmetal---ASSD.git

## Start del progetto in locale

Una volta clonato il repo per startare il progetto in locale occorre fare alcuni cambiamenti a codice;
-INDEX:
Cambiare il src in script a seconda del tipo di chiamata: "/resources/sap-ui-core.js" se con il middelware, "https://ui5.sap.com/resources/sap-ui-core.js" se in locale.
-COMPONENT:
Commentare let checkAuth = await Auth.checkAuth();
if (!checkAuth) {
Auth.\_redirectLaunchpad();
}
in caso di chiamata in locale
-ANAGRAFICA.CONTROLLER.JS:
Commentare la variabile data a seconda del tipo di chiamata, API.getAnagraficaLocal è per la chiamata in locale mentre API.getAnagrafica per la chiamata con il middelware

Una volta conclusi tali cambiamenti aprire il terminale e inserire il comando npm run start-local per avviare il programma in locale.

## Deploy del progetto

Per deployare il progetto sul server bisogna eseguire alcuni passaggi:

0. Ripetere i passaggi per lo start del progetto in locale scommentando le parti per le chiamate tramite middelware e commentando quelle per le chiamate in locale e cambiare il src in index per la chiamata in middelware.

1. Da terminale effettuare la build del progetto tramite il comando npm run build.

2. Copiare il contenuto della cartella dist nella cartella assd del server remoto, sostituendo i file esistenti. Per sicurezza eliminare i file già presenti nella cartella assd del server remoto prima di copiare i file della cartella dist.

3. Da terminale sul server remoto eseguire i comandi sudo service nginx reload, inserendo la password, e poi il comando pm2 reload 0. I comandi vanno eseguiti in sequenza.
