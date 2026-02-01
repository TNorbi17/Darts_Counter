import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DartsService } from '../Services/DartsService';
import { GameSettings } from '../Model/Darts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  showTwentyGif = signal(false);
  showLegWinGif = signal(false);
  showBustGif = signal(false);
  showHighScoreGif = signal(false);
  showOneEightyGif = signal(false);
  legWinnerName = signal('');
  showMatchWinGif = signal(false);
  private dartsService = inject(DartsService);

  players = this.dartsService.players;
  activePlayer = this.dartsService.activePlayer;
  gameStarted = this.dartsService.gameStarted;
  winner = this.dartsService.winner;

  turnScore: number | null = null;
  
  settings: GameSettings = {
    gameType: 301,
    targetSets: 1,
    targetLegs: 3,
    checkoutMode: 'STRAIGHT' 
  };

  setupPlayerNames: string[] = ['Apa', 'Norbi'];

  updatePlayerCount(count: number) {
    if (count < 1) count = 1;
    if (count > 6) count = 6;
    const currentNames = [...this.setupPlayerNames];
    if (count > currentNames.length) {
      for (let i = currentNames.length; i < count; i++) {
        currentNames.push(`Játékos ${i + 1}`);
      }
    } else {
      currentNames.length = count;
    }
    this.setupPlayerNames = currentNames;
  }

  onStartGame() {
    const validNames = this.setupPlayerNames.map((name, i) => 
      name.trim() === '' ? `Játékos ${i + 1}` : name
    );
    this.dartsService.startGame(this.settings, validNames);
  }

  onSubmitScore() {
    if (this.turnScore === null) return;
    const scoreVal = Number(this.turnScore);

    // Ellenőrizzük, hogy pontosan 20-e
    if (scoreVal === 20) {
      this.showTwentyGif.set(true); // Signal beállítása
      
      setTimeout(() => {
        this.showTwentyGif.set(false); // Signal kikapcsolása
      }, 3000);
    }
    
    // UI ellenőrzés
    const currentPlayer = this.activePlayer();
    if (currentPlayer) {
        const remaining = currentPlayer.currentScore - this.turnScore;
        // Itt nem döntünk egyértelműen a bustról, mert függ a módtól,
        // rábízzuk a service visszatérési értékére.
    }

    const result = this.dartsService.submitTurn(this.turnScore);
    
    if (result.type === 'LEG_WIN') {

      this.showLegWinGif.set(true);
      this.legWinnerName.set(result.winner.name);
      // 4 másodperc múlva tűnjön el
      setTimeout(() => {
        this.showLegWinGif.set(false);
      }, 4000);
            
    } else if (result.type === 'MATCH_WIN') {
      this.legWinnerName.set(result.winner.name); // Újrahasznosítjuk a név változót
       this.showMatchWinGif.set(true);
       
       setTimeout(() => this.showMatchWinGif.set(false), 6000);

      
    } else if (result.type === 'BUST') {
      this.showBustGif.set(true);
       
      
       setTimeout(() => {
         this.showBustGif.set(false);
       }, 3000);
    }else {
       if (scoreVal === 180) {
         this.showOneEightyGif.set(true);
         
         setTimeout(() => {
           this.showOneEightyGif.set(false);
         }, 7000);
         
       } else if (scoreVal > 80 && scoreVal < 180) {
         
         this.showHighScoreGif.set(true);
         setTimeout(() => {
           this.showHighScoreGif.set(false);
         }, 3000);
       }
      
      }

    this.turnScore = null;
  }
downloadStats() {
    this.dartsService.exportMatchData();
  }
  getCheckout(score: number): string {
    return this.dartsService.getCheckoutHint(score);
  }

  onReset() {
    this.dartsService.resetGame();
  }
}