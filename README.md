# Hydro Lab — kalkulator rozpływu wody

MVP zgodny z PRD: rozpływ w równoległych gałęziach, dobór dodatkowych oporów i przybliżonych średnic zwężek. Polski interfejs, obliczenia w przeglądarce, zapis danych w localStorage, bez backendu.

## Uruchomienie

Node.js 20.19+ lub 22.12+ (zweryfikowano na Node 24).

```sh
npm ci --cache /tmp/biznesai-npm
npm run dev -- --port 5173
```

```sh
npm test
npm run build
npm run preview
```

Katalog `dist/` można opublikować na dowolnym hostingu statycznym.

## Model

Charakterystyki gałęzi: Δp = k Qⁿ, z Q w l/min i Δp w kPa. Bisekcja wyznacza wspólne ciśnienie z bilansu przepływów. Punkt startowy Δp nie narzuca końcowego ciśnienia. Dobór normalizuje udziały w tolerancji 0,01 p.p., wyznacza minimalne wspólne ciśnienie i opory szeregowe. Kontrola rozpływu uwzględnia osobno k Qⁿ i kzw Q², również dla n ≠ 2.

Średnica otworu jest oszacowaniem z efektywnego modelu trwałej straty; Ceff = 0,61 jest założeniem startowym. Model nie jest zgodny z ISO 5167 i nie uwzględnia kawitacji ani odzysku ciśnienia. Średnica rury kontroluje geometrię — aplikacja nie przycina wyników d ≥ D.

Zmiany danych oznaczają wcześniejsze wyniki jako nieaktualne. Przycisk „Wyczyść dane” przywraca przykładowy układ i usuwa wcześniejsze wyniki.
