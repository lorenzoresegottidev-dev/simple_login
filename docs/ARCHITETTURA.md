# simple_login — come è fatta l'app e come viene verificata

> Fotografia dello stato attuale — 18 settembre 2026
> 9 file per la funzione di accesso · 20 verifiche automatiche su 4 livelli

---

## 1. Cosa fa l'app

Una pagina dove una persona può **registrarsi**, **accedere** con le proprie credenziali e **uscire**. Chi ha effettuato l'accesso resta riconosciuto anche se ricarica la pagina o chiude e riapre il browser: i dati vengono conservati nella memoria del browser stesso, non su un server.

---

## 2. Le quattro squadre

L'app è divisa in quattro gruppi di file, ognuno con un compito che gli altri non svolgono. È la stessa divisione di uno sportello:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│   IL BANCONE            Quello che la persona vede e tocca:   │
│   4 file                moduli da compilare, pulsanti,        │
│                         messaggi, riquadro della sessione     │
│                                                               │
│   ──────────────────────────────────────────────────────────  │
│                                                               │
│   IL COORDINATORE       Riceve la richiesta dal bancone,      │
│   1 file                consulta il regolamento, ordina       │
│                         all'archivio di scrivere, riferisce   │
│                                                               │
│   ──────────────────────────────────────────────────────────  │
│                                                               │
│   IL REGOLAMENTO        Le regole di accesso: cosa è valido,  │
│   1 file                chi esiste già, quali credenziali     │
│                         corrispondono. Solo giudizi.          │
│                                                               │
│   ──────────────────────────────────────────────────────────  │
│                                                               │
│   L'ARCHIVIO            L'unico che apre il cassetto dove i   │
│   1 file                dati sono conservati, e l'unico che   │
│                         sa cosa fare se il cassetto è rotto   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

Due principi reggono tutta l'organizzazione:

**Chi giudica non tocca i dati.** Il regolamento non apre mai il cassetto: riceve l'elenco delle persone registrate e dice se la richiesta è accettabile. Nient'altro.

**Chi tocca i dati non giudica.** L'archivio non sa cosa sia una password sbagliata: sa solo leggere, scrivere e riferire se ci è riuscito.

---

## 3. Cosa succede quando qualcuno si registra

```
   La persona compila i campi e preme "Registrami"
                    │
                    ▼
   ① IL BANCONE non decide nulla: passa i tre valori al coordinatore
                    │
                    ▼
   ② IL COORDINATORE chiede all'archivio l'elenco dei registrati
                    │
                    ▼
   ③ IL REGOLAMENTO esamina: campi compilati? email già presente?
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     richiesta             richiesta
     respinta              accettata
          │                   │
          │                   ▼
          │         ④ L'ARCHIVIO prova a scrivere
          │                   │
          │         ┌─────────┴─────────┐
          │         ▼                   ▼
          │     non riesce           riesce
          │         │                   │
          ▼         ▼                   ▼
    ┌──────────────────────────────────────────┐
    │  ⑤ IL BANCONE mostra l'esito              │
    │     • respinta → i campi restano pieni    │
    │     • fallita  → i campi restano pieni    │
    │     • riuscita → i campi si svuotano      │
    └──────────────────────────────────────────┘
```

Il dettaglio del punto ⑤ non è un vezzo: se il salvataggio fallisce (memoria del browser piena, navigazione anonima), l'app **non** cancella quanto la persona ha scritto e **non** dichiara un successo che non c'è stato.

---

## 4. Le parti, una per una

### Il bancone — `src/components/auth/`

| File | Cosa mostra |
|---|---|
| `SimpleUserAuth` | La pagina intera: intestazione, messaggi, e — a seconda che ci sia o no un accesso attivo — i due moduli oppure il riquadro della sessione. Non prende nessuna decisione: raccoglie quello che la persona scrive e chiede al coordinatore di occuparsene |
| `RegisterForm` | Il modulo di registrazione: nome, email, password, pulsante. Non sa cosa succederà quando viene premuto |
| `LoginForm` | Il modulo di accesso: email, password, pulsante |
| `SessionCard` | Il riquadro «Ciao, Anna» con l'email e il pulsante di uscita |
| `MessageBanner` | La striscia colorata con l'esito. **È l'unico posto dell'app dove sono scritte le frasi in italiano** — verde per i successi, rossa per gli errori, azzurra per le informazioni |

L'ultima riga merita attenzione: il regolamento non emette frasi, emette **etichette** (`EMAIL_TAKEN`, `INVALID_CREDENTIALS`). La traduzione in *«Questo utente è già registrato.»* avviene solo qui. Cambiare le parole dell'interfaccia — o aggiungere una seconda lingua — è un intervento su un file solo, e non tocca alcuna regola.

### Il coordinatore — `src/lib/auth/useAuth.ts`

Mette a disposizione del bancone quattro cose: **chi ha l'accesso attivo**, **l'ultimo messaggio da mostrare**, e le tre operazioni **registrati / accedi / esci**.

| Operazione | Sequenza |
|---|---|
| `register` | chiede l'elenco → fa valutare la richiesta → se accettata fa scrivere → se la scrittura fallisce lo dichiara |
| `login` | chiede l'elenco → fa verificare le credenziali → apre la sessione → segnala chi è entrato |
| `logout` | fa chiudere la sessione → azzera chi è entrato |
| all'apertura | chiede all'archivio se c'era già una sessione aperta, e in tal caso riconosce subito la persona |

Ogni operazione risponde al bancone **riuscita / non riuscita**: è così che il bancone sa se può svuotare i campi.

Una particolarità voluta: il coordinatore accetta di lavorare con **un archivio qualsiasi**, purché sappia leggere e scrivere. Nell'app vero è quello del browser; nelle verifiche è un archivio finto, che si può far fallire a comando. È il motivo per cui il caso «il salvataggio non riesce» è verificabile senza dover riempire davvero la memoria di un browser.

### Il regolamento — `src/lib/auth/authLogic.ts`

| Regola | Cosa stabilisce |
|---|---|
| `decideRegistration` | I campi devono essere compilati. Spazi iniziali e finali vengono ignorati, l'email viene ricondotta a lettere minuscole. Se quell'email risulta già registrata, la richiesta è respinta. Altrimenti la nuova persona viene composta e restituita |
| `decideLogin` | Stessa pulizia di email e spazi. Cerca una corrispondenza esatta fra email e password nell'elenco ricevuto. Se non la trova, credenziali non valide |
| `logoutDecision` | Lo stato di «uscita effettuata». Non è un calcolo, è semplicemente il risultato che si ottiene sempre |

Conseguenza pratica delle due righe sulla pulizia: `Anna@Email.com` e ` anna@email.com ` sono **la stessa persona**, sia in registrazione sia in accesso. È la regola più facile da rompere per sbaglio, ed è quella verificata per prima.

### L'archivio — `src/lib/auth/storage.ts`

| Operazione | Cosa fa | Se qualcosa va storto |
|---|---|---|
| `readUsers` | Legge l'elenco dei registrati | Restituisce un elenco vuoto |
| `writeUsers` | Salva l'elenco aggiornato | Dichiara di non esserci riuscito |
| `readSession` | Legge chi ha l'accesso attivo | Restituisce «nessuno» |
| `writeSession` | Apre la sessione | Dichiara di non esserci riuscito |
| `clearSession` | Chiude la sessione | Dichiara di non esserci riuscito |

Tutto ciò che riguarda il cassetto dei dati è raccolto qui, comprese le protezioni: se il contenuto risultasse illeggibile — danneggiato, scritto da una versione precedente dell'app, alterato da un'estensione del browser — l'archivio riparte da un elenco vuoto invece di far bloccare la pagina. Ed è l'unico file dell'app in cui una protezione del genere serva, perché è l'unico che apre il cassetto.

---

## 5. Perché è organizzato così

Perché ogni pezzo possa essere messo alla prova **da solo**, senza trascinarsi dietro tutto il resto.

| Per verificare… | Serve… |
|---|---|
| che due email uguali a meno di maiuscole siano la stessa persona | solo il regolamento, con un elenco scritto a mano |
| che il fallimento di un salvataggio non cancelli i dati digitati | il coordinatore e un archivio finto che rifiuta di scrivere |
| che un contenuto illeggibile non blocchi la pagina | solo l'archivio |
| che una persona riesca davvero ad accedere | l'app intera, in un browser vero |

Con tutto raccolto in un unico file — come era all'inizio — ognuna di queste verifiche avrebbe richiesto di aprire la pagina, compilare i moduli e premere i pulsanti. Le prime tre sarebbero costate cento volte tanto, e alcune sarebbero state di fatto impossibili.

---

## 6. I quattro livelli di verifica

```
                        ╱╲
                       ╱  ╲       BROWSER VERO — 4 prove
                      ╱────╲      « la persona ci riesce? »
                     ╱      ╲     lente, realistiche
                    ╱ SCHERMO╲
                   ╱          ╲   SCHERMO — 5 prove
                  ╱────────────╲  « l'interfaccia mostra e reagisce? »
                 ╱ COLLABORAZIONE╲
                ╱                 ╲ COLLABORAZIONE — 6 prove
               ╱───────────────────╲« i pezzi lavorano insieme? »
              ╱       REGOLE        ╲
             ╱_______________________╲REGOLE — 5 prove
                                       « il giudizio è corretto? »
                                       istantanee, precisissime

     veloci e mirate  ◄──────────────────────►  lente e complete
```

Più si scende, più le prove sono rapide e indicano con precisione **dove** è il problema. Più si sale, più somigliano a quello che farebbe una persona vera, ma quando falliscono dicono soltanto **che** qualcosa non va.

La regola che tiene in equilibrio la piramide: **ogni caso si verifica una volta sola, al livello più basso capace di verificarlo.** Per questo «campi vuoti» ed «email già registrata» stanno fra le regole e non vengono ripetuti nel browser.

Nota organizzativa: le prove sulle regole girano in un ambiente che **non ha nessuna pagina web a disposizione**. È una precauzione voluta — se qualcuno mescolasse per errore del codice di interfaccia dentro il regolamento, quelle prove smetterebbero di funzionare all'istante.

---

## 7. Le 20 verifiche

### Livello REGOLE — 5 prove · `unit_tests/`

| # | Verifica |
|---|---|
| 1 | Registrando ` Luca Verdi ` con `LUCA@EMAIL.COM `, spazi ed maiuscole vengono ripuliti e la persona è creata correttamente |
| 2 | Chi prova a registrarsi con un'email già presente, scritta in maiuscolo e con spazi, viene riconosciuto come già registrato |
| 3 | Chi accede scrivendo l'email in maiuscolo viene comunque riconosciuto |
| 4 | Email giusta ma password sbagliata → credenziali non valide |
| 5 | Lo stato di uscita riporta «nessuno collegato» e il messaggio di disconnessione |

### Livello COLLABORAZIONE — 6 prove · `integration_tests/`

**Coordinatore con archivio finto (3)**

| # | Verifica |
|---|---|
| 6 | Il ciclo completo registrazione → accesso → uscita funziona, e a ogni passo la persona riconosciuta è quella giusta |
| 7 | Se l'archivio rifiuta di scrivere, la registrazione viene dichiarata fallita, nessuno risulta collegato e compare il messaggio d'errore |
| 8 | Se all'apertura esiste già una sessione, la persona viene riconosciuta immediatamente, senza dover accedere di nuovo |

**Archivio vero, con la memoria del browser (3)**

| # | Verifica |
|---|---|
| 9 | Se il contenuto salvato è illeggibile, l'archivio restituisce un elenco vuoto invece di far bloccare la pagina |
| 10 | Se non c'è mai stato niente di salvato, restituisce elenco vuoto e nessuna sessione |
| 11 | Se il salvataggio viene rifiutato (memoria piena), l'archivio lo dichiara invece di fingere che sia andato bene |

La prova 9 è quella che il finto archivio non potrebbe mai fare: un archivio finto non può avere dati corrotti.

### Livello SCHERMO — 5 prove · `component_tests/`

| # | Verifica |
|---|---|
| 12 | L'etichetta `INVALID_CREDENTIALS` viene mostrata come *«Credenziali non valide.»* |
| 13 | I due moduli riferiscono correttamente ciò che viene digitato e il momento in cui si preme il pulsante |
| 14 | Il riquadro della sessione mostra il nome e riferisce la richiesta di uscita |
| 15 | Dopo una registrazione riuscita i campi si svuotano |
| 16 | Se il salvataggio fallisce i campi **restano compilati** e compare il messaggio d'errore |

Le prove 15 e 16 sono una coppia: insieme dimostrano che l'app distingue fra «fatto» e «creduto fatto».

### Livello BROWSER VERO — 4 prove · `e2e_tests/`

| # | Verifica |
|---|---|
| 17 | Una persona si registra, accede, e vede il proprio nome ed email |
| 18 | Con la password sbagliata compare l'errore e il modulo di accesso resta disponibile |
| 19 | Dopo aver ricaricato la pagina, la persona è **ancora collegata** |
| 20 | Premendo «Logout» compare la conferma e si torna ai moduli |

La 19 è la ragione d'essere di questo livello: è l'unica prova dell'intera serie che spegne e riaccende davvero la pagina.

---

## 8. Dove va una nuova verifica

```
La prova ha bisogno di vedere la pagina disegnata?
├── NO ──► ha bisogno di leggere o scrivere dati salvati?
│          ├── NO ──► REGOLE
│          └── SÌ ──► COLLABORAZIONE
└── SÌ ──► serve un browser autentico?
           ├── NO ──► SCHERMO
           └── SÌ ──► BROWSER VERO
```

---

## 9. Cosa manca ancora

Nessuno di questi punti riguarda l'organizzazione dell'app: sono strumenti di supporto e automazione.

- [ ] I file di verifica non vengono controllati dal controllo automatico dei tipi
- [ ] Una libreria di supporto alle verifiche è installata ma mai attivata
- [ ] Nelle prove sul browser vero i due moduli vengono distinti per posizione («il primo», «il secondo») invece che per nome: dando un nome a ciascun modulo, invertirli non romperebbe più niente
- [ ] La configurazione delle prove sul browser va adattata per funzionare sul server di verifica automatica (avvio dell'app in versione definitiva, ripetizione in caso di fallimento, registrazione di cosa è successo)
- [ ] Mancano il controllo automatico dello stile del codice e quello dei tipi
- [ ] Manca la verifica automatica a ogni modifica (GitHub Actions)
- [ ] Manca la protezione del ramo principale, che impedisce di inserire modifiche non verificate
- [ ] Tutto questo lavoro esiste solo sul computer locale: il progetto pubblicato è ancora fermo alle prime due modifiche
