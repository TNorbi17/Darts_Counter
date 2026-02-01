# 🎯 Darts Counter

A **Darts Counter** egy modern, Angular alapú darts számláló alkalmazás, amely segít nyomon követni a pontszámokat, statisztikákat és a játékmenetet. Reszponzív felülettel és szórakoztató animációkkal teszi élvezetesebbé a játékot.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## ✨ Funkciók

### ⚙️ Játék Beállítások
- **Dinamikus játékmódok:** Választható pontszámok: `101`, `201`, `301`, `401`, `501`, `601`, `701`.
- **Kiszálló módok:**
  - **Double Out:** (Hagyományos) Duplával kell kiszállni, 1 pont maradék esetén "Bust".
  - **Straight Out:** Sima kiszálló, akár 1-es dobással is nyerhető.
- **Játékosok kezelése:** 1-től akár 6 játékosig, egyedi nevek megadásával.
- **Meccs konfiguráció:** Szettek és Legek számának beállítása.

### 🎮 Játékmenet
- **Intelligens számolás:** Automatikus pontlevonás és körváltás.
- **Valós idejű statisztikák:**
  - Utolsó Leg átlag.
  - Meccs átlag.
  - Legmagasabb dobás.
- **Kiszálló segítség (Checkout Hint):** Ha kiszállóra érsz (170 alatt), az app javaslatot tesz a dobásokra (pl. T20 T20 BULL).
- **Hibakezelés:** "Bust" (Besokallás) detektálása a kiválasztott kiszálló szabály alapján.

### 🎉 Vizuális Élmények (GIF Overlay)
Az alkalmazás automatikusan GIF animációkat jelenít meg a képernyőn bizonyos eseményekkor:
- **20 pont:** "Szép húszas!"
- **80+ pont:** "Szép dobás!"
- **180:** Speciális, teljes képernyős "ONE HUNDRED AND EIGHTY" animáció.
- **Leg Győzelem:** Ünneplés a győztes nevével.
- **Meccs Győzelem:** A végső győztes ünneplése (Arany felirattal).
- **Bust:** Figyelmeztető animáció besokalláskor.

---

## 🛠️ Technológiák

A projekt a legmodernebb Angular megoldásokat használja:
- **Keretrendszer:** Angular 17+ (Standalone Components).
- **State Management:** **Angular Signals** (`signal`, `computed`) a reaktív és nagy teljesítményű állapotkezelésért.
- **Stílus:** Tiszta CSS3 (SCSS nélkül), CSS változók (`var(--primary-blue)`), Flexbox és Grid layout.
- **Architektúra:** Service-alapú logika (`DartsService`) elválasztva a megjelenítéstől (`AppComponent`).

---

## 🚀 Telepítés és Futtatás

Kövesd ezeket a lépéseket a projekt futtatásához a saját gépeden:

### Előfeltételek
- [Node.js](https://nodejs.org/) telepítve legyen.
- Angular CLI telepítve: `npm install -g @angular/cli`

### Lépések

1. **Klónozd a repót:**
   ```bash
   git clone [https://github.com/FELHASZNALONEV/Darts_Counter.git](https://github.com/FELHASZNALONEV/Darts_Counter.git)
   cd Darts_Counter
