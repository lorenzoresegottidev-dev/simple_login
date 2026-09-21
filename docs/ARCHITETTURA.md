# simple_login — come è fatta l'app e come viene verificata

> Stato al 18 settembre 2026 — 9 file per la funzione di accesso, 20 verifiche automatiche su 4 livelli

---

## 1. Cosa fa l'app

Una pagina dove una persona può **registrarsi**, **accedere** e **uscire**. Chi ha effettuato l'accesso resta riconosciuto anche dopo aver ricaricato la pagina: i dati sono conservati nella memoria del browser, non su un server.

---

## 2. Com'è divisa

```
┌──────────────────────────────────────────────────────────────────┐
│  INTERFACCIA — 4 file                                            │
│  Moduli, pulsanti, messaggi, riquadro della sessione.            │
│  Non decide e non salva.                                         │
├──────────────────────────────────────────────────────────────────┤
│  GESTIONE DELLE OPERAZIONI — 1 file                              │
│  Esegue la sequenza: recupera i dati, fa valutare la richiesta,  │
│  fa salvare, comunica l'esito.                                   │
├──────────────────────────────────────────────────────────────────┤
│  REGOLE DI ACCESSO — 1 file                                      │
│  Stabilisce cosa è valido. Solo valutazioni, nessun dato letto   │
│  o scritto.                                                      │
├──────────────────────────────────────────────────────────────────┤
│  SALVATAGGIO DEI DATI — 1 file                                   │
│  L'unico che accede alla memoria del browser, e l'unico che sa   │
│  cosa fare se è illeggibile o piena.                             │
└──────────────────────────────────────────────────────────────────┘
```

Due principi reggono la divisione:

- **Le regole non leggono né scrivono dati.** Ricevono l'elenco delle persone registrate già pronto e stabiliscono solo se la richiesta è accettabile.
- **Il salvataggio non valuta nulla.** Non sa cosa sia una password sbagliata: legge, scrive e riferisce se ci è riuscito.

---

## 3. Cosa succede durante una registrazione

```
   La persona compila i campi e preme "Registrami"
                    │
   ① L'INTERFACCIA passa i tre valori alla gestione
                    │
   ② LA GESTIONE recupera l'elenco delle persone registrate
                    │
   ③ LE REGOLE valutano: campi compilati? email già presente?
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      respinta            accettata
          │                   │
          │         ④ IL SALVATAGGIO prova a scrivere
          │             ┌─────┴─────┐
          │             ▼           ▼
          │         non riesce    riesce
          ▼             ▼           ▼
    ┌───────────────────────────────────────────┐
    │  ⑤ L'INTERFACCIA mostra l'esito            │
    │     respinta o fallita → campi pieni       │
    │     riuscita           → campi svuotati    │
    └───────────────────────────────────────────┘
```

Il punto ⑤ non è estetico: se il salvataggio fallisce — memoria piena, navigazione anonima — l'app non cancella quanto è stato digitato e non dichiara un successo che non c'è stato.

---

## 4. Le parti, una per una

### Interfaccia — `src/components/auth/`

| File | Cosa mostra |
|---|---|
| `SimpleUserAuth` | La pagina completa. Raccoglie ciò che viene digitato e inoltra le richieste |
| `RegisterForm` | Modulo di registrazione: nome, email, password |
| `LoginForm` | Modulo di accesso: email, password |
| `SessionCard` | Riquadro «Ciao, Anna» con email e pulsante di uscita |
| `MessageBanner` | Striscia colorata con l'esito |

`MessageBanner` è **l'unico punto in cui sono scritte le frasi in italiano**. Le regole non producono frasi ma etichette (`EMAIL_TAKEN`, `INVALID_CREDENTIALS`), tradotte soltanto qui.

### Gestione delle operazioni — `src/lib/auth/useAuth.ts`

Mette a disposizione dell'interfaccia: **chi ha l'accesso attivo**, **l'ultimo messaggio**, e le operazioni **registrazione / accesso / uscita**.

| Operazione | Sequenza |
|---|---|
| Registrazione | recupera l'elenco → fa valutare → se accettata fa salvare → se il salvataggio fallisce lo dichiara |
| Accesso | recupera l'elenco → fa verificare le credenziali → apre la sessione |
| Uscita | chiude la sessione |
| All'apertura | se esiste già una sessione, riconosce subito la persona |

Ogni operazione risponde **riuscita** o **non riuscita**: è così che l'interfaccia sa se può svuotare i campi. E funziona con **qualunque sistema di salvataggio**, purché sappia leggere e scrivere — dettaglio da cui dipende metà della strategia di verifica.

### Regole di accesso — `src/lib/auth/authLogic.ts`

| Regola | Cosa stabilisce |
|---|---|
| `decideRegistration` | Campi compilati; spazi ignorati ed email ricondotta a minuscole; se l'email risulta già presente la richiesta è respinta |
| `decideLogin` | Stessa pulizia; cerca nell'elenco ricevuto la corrispondenza fra email e password |
| `logoutDecision` | L'esito dell'uscita, sempre identico |

Conseguenza pratica: `Anna@Email.com` e ` anna@email.com ` sono **la stessa persona**.

### Salvataggio dei dati — `src/lib/auth/storage.ts`

| Operazione | In caso di problema |
|---|---|
| `readUsers` — legge l'elenco | elenco vuoto |
| `writeUsers` — salva l'elenco | dichiara di non esserci riuscito |
| `readSession` — legge chi è collegato | «nessuno» |
| `writeSession` — apre la sessione | dichiara di non esserci riuscito |
| `clearSession` — chiude la sessione | dichiara di non esserci riuscito |

Se il contenuto salvato è illeggibile — danneggiato, scritto da una versione precedente, alterato da un'estensione — l'app riparte da un elenco vuoto invece di bloccarsi.

---

## 5. Come sono fatte le verifiche

Il principio è **sostituire con qualcosa di finto tutto ciò che non si sta verificando in quel momento.** Meno cose vere ci sono attorno, più la prova è veloce e più il fallimento indica con precisione il colpevole.

| Livello | L'app è… | I dati sono… | Il salvataggio è… | La pagina è… |
|---|---|---|---|---|
| **Regole** | tre funzioni | scritti nel test | assente | assente |
| **Collaborazione** | una parte sola | scritti nel test | finto, in memoria | simulata |
| **Schermo** | interfaccia | scritti nel test | finto o simulato | simulata |
| **Browser** | tutta, avviata davvero | digitati | vero | vera |

### Regole — dati scritti a mano

Alle funzioni si passa direttamente un elenco di persone registrate, scritto nel test:

```
elenco = [ { nome: "Anna Bianchi", email: "anna@email.com", password: "secret123" } ]
```

Nessuna memoria del browser, nessun archivio, nessuna pagina: il test chiama la funzione con quei dati e controlla la risposta. **Non esiste una banca dati da preparare o da ripulire** — è per questo che ognuna di queste prove dura millesimi di secondo e non può fallire per cause esterne.

Le prove a questo livello girano in un ambiente **privo di qualunque pagina web**: se del codice di interfaccia finisse per errore nel file delle regole, smetterebbero subito di funzionare.

### Collaborazione — salvataggio finto, con interruttore

Qui si verifica che le parti lavorino insieme. Al posto della memoria del browser si usa un **salvataggio finto** che tiene tutto in una variabile: si comporta come quello vero — si può scrivere, rileggere, cancellare — ma vive solo per la durata della prova.

Ha in più un interruttore: **«rifiuta di scrivere»**. Accendendolo si riproduce in una riga la situazione «memoria piena o navigazione anonima», che con il salvataggio vero sarebbe quasi impossibile provocare a comando. È così che si verifica che un fallimento venga dichiarato invece di essere ignorato.

Tre prove di questo gruppo usano invece il **salvataggio vero**, appoggiato a una riproduzione della memoria del browser che funziona nel terminale. Servono a controllare proprio ciò che il finto non può avere: contenuti danneggiati e scritture rifiutate.

### Schermo — pagina simulata

La pagina viene disegnata in una riproduzione del browser che vive nel terminale: niente finestre, niente attesa di caricamento. Le prove digitano nei campi e premono i pulsanti come farebbe una persona, poi controllano cosa compare.

Ai moduli vengono passate **funzioni finte** al posto di quelle vere: non fanno nulla, si limitano a registrare di essere state chiamate. Basta questo per verificare che un modulo riferisca correttamente ciò che accade, **senza che nulla venga realmente salvato**.

### Browser — tutto vero

L'app viene costruita e avviata per davvero, e un Chrome reale la usa: digita, preme, ricarica la pagina. Nessuna sostituzione, nessuna finzione. È il livello più lento e quello che più somiglia all'uso reale.

---

## 6. I quattro livelli

```
                        ╱╲
                       ╱  ╲       BROWSER — 4 prove
                      ╱────╲      « la persona ci riesce? »
                     ╱      ╲     lente, realistiche
                    ╱ SCHERMO╲
                   ╱          ╲   SCHERMO — 5 prove
                  ╱────────────╲  « l'interfaccia mostra e reagisce? »
                 ╱ COLLABORAZIONE╲
                ╱                 ╲ COLLABORAZIONE — 6 prove
               ╱───────────────────╲« le parti lavorano insieme? »
              ╱       REGOLE        ╲
             ╱_______________________╲REGOLE — 5 prove
                                       « la valutazione è corretta? »
                                       istantanee, precisissime

     veloci e mirate  ◄──────────────────────►  lente e complete
```

Più si scende, più le prove sono rapide e dicono con precisione **dove** è il problema. Più si sale, più somigliano all'uso reale, ma quando falliscono segnalano soltanto **che** qualcosa non funziona.

La regola che tiene in equilibrio la piramide: **ogni caso si verifica una volta sola, al livello più basso capace di verificarlo.** Per questo «campi vuoti» ed «email già registrata» stanno fra le regole e non vengono ripetuti nel browser.

---

## 7. Le 20 verifiche

### REGOLE — 5 prove · `unit_tests/`

| # | Verifica |
|---|---|
| 1 | Registrando ` Luca Verdi ` con `LUCA@EMAIL.COM `, spazi e maiuscole vengono ripuliti |
| 2 | Chi si registra con un'email già presente, scritta in maiuscolo e con spazi, è riconosciuto come già registrato |
| 3 | Chi accede scrivendo l'email in maiuscolo viene comunque riconosciuto |
| 4 | Email corretta ma password sbagliata → credenziali non valide |
| 5 | L'esito dell'uscita riporta «nessuno collegato» e il messaggio di disconnessione |

### COLLABORAZIONE — 6 prove · `integration_tests/`

**Con salvataggio finto (3)**

| # | Verifica |
|---|---|
| 6 | Il ciclo registrazione → accesso → uscita funziona, e a ogni passo la persona riconosciuta è quella giusta |
| 7 | Con l'interruttore «rifiuta di scrivere» acceso, la registrazione risulta fallita e compare il messaggio d'errore |
| 8 | Se all'apertura esiste già una sessione, la persona è riconosciuta senza dover accedere di nuovo |

**Con salvataggio vero (3)**

| # | Verifica |
|---|---|
| 9 | Contenuto salvato illeggibile → si riparte da un elenco vuoto invece di bloccare la pagina |
| 10 | Nulla di salvato → elenco vuoto e nessuna sessione |
| 11 | Scrittura rifiutata → il fallimento viene dichiarato invece di essere ignorato |

### SCHERMO — 5 prove · `component_tests/`

| # | Verifica |
|---|---|
| 12 | L'etichetta `INVALID_CREDENTIALS` compare come *«Credenziali non valide.»* |
| 13 | I due moduli riferiscono ciò che viene digitato e il momento in cui si preme il pulsante |
| 14 | Il riquadro della sessione mostra il nome e inoltra la richiesta di uscita |
| 15 | Dopo una registrazione riuscita i campi si svuotano |
| 16 | Se il salvataggio fallisce i campi **restano compilati** e compare l'errore |

Le prove 15 e 16 vanno lette insieme: dimostrano che l'app distingue un'operazione riuscita da una che sembra riuscita.

### BROWSER — 4 prove · `e2e_tests/`

| # | Verifica |
|---|---|
| 17 | Una persona si registra, accede e vede il proprio nome ed email |
| 18 | Password sbagliata → errore, e il modulo di accesso resta disponibile |
| 19 | Dopo aver ricaricato la pagina, la persona è **ancora collegata** |
| 20 | Premendo «Logout» compare la conferma e si torna ai moduli |

La 19 è la ragione d'essere di questo livello: è l'unica prova che ricarica davvero la pagina.

---

## 8. Dove va una nuova verifica

```
La prova ha bisogno di vedere la pagina disegnata?
├── NO ──► ha bisogno di leggere o scrivere dati salvati?
│          ├── NO ──► REGOLE
│          └── SÌ ──► COLLABORAZIONE
└── SÌ ──► serve un browser autentico?
           ├── NO ──► SCHERMO
           └── SÌ ──► BROWSER
```
