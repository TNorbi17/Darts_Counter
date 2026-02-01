import { Injectable, computed, signal } from '@angular/core';
import { GameSettings, Player } from '../Model/Darts';

export type TurnResult = 
  | { type: 'CONTINUE' }
  | { type: 'BUST' }
  | { type: 'LEG_WIN', winner: Player }
  | { type: 'MATCH_WIN', winner: Player }
  | { type: 'INVALID' };

@Injectable({
  providedIn: 'root'
})
export class DartsService {
  readonly gameStarted = signal(false);
  readonly activePlayerIndex = signal(0);
  readonly winner = signal<Player | null>(null);
  readonly players = signal<Player[]>([]);
  
  readonly settings = signal<GameSettings>({
    gameType: 301,
    targetSets: 1,
    targetLegs: 3,
    checkoutMode: 'DOUBLE' // Alapértelmezett beállítás
  });

  readonly activePlayer = computed(() => {
    const ps = this.players();
    return ps.length > 0 ? ps[this.activePlayerIndex()] : null;
  });

  startGame(newSettings: GameSettings, playerNames: string[]) {
    this.settings.set(newSettings);
    const newPlayers = playerNames.map((name, index) => 
      this.createPlayer(index + 1, name || `Játékos ${index + 1}`)
    );
    this.players.set(newPlayers);
    this.activePlayerIndex.set(0);
    this.winner.set(null);
    this.gameStarted.set(true);
  }

  submitTurn(score: number): TurnResult {
    if (!this.gameStarted() || score > 180 || score < 0) return { type: 'INVALID' };

    const currentPlayers = [...this.players()];
    const currentIndex = this.activePlayerIndex();
    const player = { ...currentPlayers[currentIndex] };
    
    const remaining = player.currentScore - score;
    const mode = this.settings().checkoutMode;

    // --- LEG GYŐZELEM ---
    if (remaining === 0) {
      this.registerThrow(player, score);
      currentPlayers[currentIndex] = player;
      this.handleLegWin(player, currentPlayers);
      this.players.set(currentPlayers);

      if (this.winner()) {
        return { type: 'MATCH_WIN', winner: player };
      } else {
        return { type: 'LEG_WIN', winner: player };
      }
    }

    // --- BUST LOGIKA ---
    let isBust = false;

    if (remaining < 0) {
      // 0 alá menni mindig BUST
      isBust = true;
    } else if (remaining === 1) {
      // Ez a különbség a két mód között!
      if (mode === 'DOUBLE') {
        isBust = true; // Double Outnál az 1 pont BUST
      } else {
        isBust = false; // Straight Outnál az 1 pont ÉRVÉNYES (lehet dobni 1-est)
      }
    }

    if (isBust) {
      this.registerThrow(player, 0); 
      currentPlayers[currentIndex] = player;
      this.players.set(currentPlayers);
      this.nextTurn();
      return { type: 'BUST' };

    } else {
      // --- ÉRVÉNYES DOBÁS ---
      player.currentScore = remaining;
      this.registerThrow(player, score);
      currentPlayers[currentIndex] = player;
      this.players.set(currentPlayers);
      this.nextTurn();
      return { type: 'CONTINUE' };
    }
  }

  resetGame() {
    this.gameStarted.set(false);
    this.winner.set(null);
    this.players.set([]);
  }

  getCheckoutHint(score: number): string {
    const mode = this.settings().checkoutMode;

    // Ha Double Out és 1 vagy kevesebb, akkor nincs kiszálló (vagy bust)
    if (mode === 'DOUBLE' && score <= 1) return '';
    if (score > 170) return '';

    const checkouts: Record<number, string> = {
      170: 'T20 T20 BULL', 167: 'T20 T19 BULL', 164: 'T20 T18 BULL',
      161: 'T20 T17 BULL', 160: 'T20 T20 D20',
      100: 'T20 D20', 60: 'S20 D20', 50: 'S10 D20', 40: 'D20', 32: 'D16', 16: 'D8'
    };

    // Straight Out specifikus segítség
    if (mode === 'STRAIGHT') {
      if (score === 1) return 'S1';
      if (score <= 20) return `S${score}`;
    }

    if (checkouts[score]) return checkouts[score];
    if (score <= 40 && score % 2 === 0) return `D${score / 2}`;
    
    return 'Keress kiszállót';
  }

  private nextTurn() {
    const nextIndex = (this.activePlayerIndex() + 1) % this.players().length;
    this.activePlayerIndex.set(nextIndex);
  }

  private registerThrow(player: Player, score: number) {
    player.history = [...player.history, score];
    player.matchHistory = [...player.matchHistory, score];
    this.updateStats(player);
  }

  private updateStats(player: Player) {
    // Csak a valódi számokat vesszük figyelembe (a null-t nem)
    const validThrows = player.matchHistory.filter((val): val is number => val !== null);
    
    const totalScore = validThrows.reduce((a, b) => a + b, 0);
    const avg = validThrows.length > 0 ? totalScore / validThrows.length : 0;
    const currentHigh = player.history.length > 0 ? Math.max(...player.history) : 0;
    
    player.stats = {
      ...player.stats,
      matchAvg: Number(avg.toFixed(2)),
      highestScore: Math.max(player.stats.highestScore, currentHigh)
    };
  }
exportMatchData() {
    const players = this.players();
    const settings = this.settings();
    const winner = this.winner();
    const date = new Date().toLocaleString('hu-HU');

    // 1. RÉSZ: FEJLÉC ADATOK
    let csv = `DARTS MATCH REPORT\n`;
    csv += `Dátum;${date}\n`;
    csv += `Játék típus;${settings.gameType}\n`;
    csv += `Kiszálló mód;${settings.checkoutMode}\n`;
    csv += `Győztes;${winner ? winner.name : 'Nincs'}\n\n`;

    // 2. RÉSZ: JÁTÉKOS STATISZTIKÁK
    csv += `--- STATISZTIKÁK ---\n`;
    csv += `Név;Szettek;Legek;Meccs Átlag;Max Dobás;Utolsó Leg Átlag\n`;
    
    players.forEach(p => {
      csv += `${p.name};${p.sets};${p.legs};${p.stats.matchAvg};${p.stats.highestScore};${p.stats.lastLegAvg}\n`;
    });
    csv += `\n`;

    // 3. RÉSZ: RÉSZLETES DOBÁS TÖRTÉNET
    csv += `--- DOBÁSOK TÖRTÉNETE ---\n`;
    
    // Fejléc a dobásokhoz: "Kör;Játékos1;Játékos2..."
    const playerNames = players.map(p => p.name).join(';');
    csv += `Dobás sorszáma;${playerNames}\n`;

    // Megkeressük a leghosszabb dobáslistát
    const maxThrows = Math.max(...this.players().map(p => p.matchHistory.length));

    for (let i = 0; i < maxThrows; i++) {
      let row = `${i + 1}`;
      this.players().forEach(p => {
        const val = p.matchHistory[i];
        // Ha null vagy undefined, akkor kötőjel, egyébként a szám
        const score = (val !== null && val !== undefined) ? val : '-';
        row += `;${score}`;
      });
      csv += `${row}\n`;
    }

    // Fájlnév generálása: darts_match_ÉÉÉÉHHNN_ÓÓPP.csv
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    this.downloadFile(csv, `darts_match_${timestamp}.csv`);
  }

  // Segédfüggvény a letöltés elindításához a böngészőben
  private downloadFile(content: string, fileName: string) {
    // UTF-8 BOM hozzáadása, hogy az Excel helyesen kezelje az ékezeteket
    const bom = '\uFEFF'; 
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
 private handleLegWin(winner: Player, allPlayers: Player[]) {
    // Statisztikák mentése (ez maradhat a régi logika szerint a history alapján)
    allPlayers.forEach(p => {
      const sum = p.history.reduce((a, b) => a + b, 0);
      const count = p.history.length;
      const legAvg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
      p.stats = { ...p.stats, lastLegAvg: legAvg };
    });

    // --- ÚJ RÉSZ: MATCH HISTORY SZINKRONIZÁLÁS ---
    // Megnézzük, hány körből nyert a győztes ebben a legben
    const winnerThrowsInLeg = winner.history.length;

    allPlayers.forEach(p => {
      // Ha valaki nem a győztes, és kevesebbet dobott (mert nem került rá sor),
      // akkor beteszünk egy null-t a matchHistory-ba, hogy a sorok egyezzenek.
      if (p.id !== winner.id) {
        if (p.history.length < winnerThrowsInLeg) {
           p.matchHistory.push(null); 
        }
      }
    });

    winner.legs++;

    if (winner.legs >= this.settings().targetLegs) {
      winner.sets++;
      allPlayers.forEach(p => p.legs = 0);
    }

    if (winner.sets >= this.settings().targetSets) {
      this.winner.set(winner);
    } else {
      // Reset
      allPlayers.forEach(p => {
        p.currentScore = this.settings().gameType;
        p.history = []; 
      });
      this.activePlayerIndex.set(allPlayers.findIndex(p => p.id === winner.id));
    }
  }

  private createPlayer(id: number, name: string): Player {
    return {
      id, name,
      currentScore: this.settings().gameType,
      history: [], matchHistory: [],
      sets: 0, legs: 0,
      stats: { lastLegAvg: 0, matchAvg: 0, highestScore: 0 }
    };
  }
}