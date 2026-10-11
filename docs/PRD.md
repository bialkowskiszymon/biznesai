# PRD — kalkulator rozpływu wody i doboru zwężek

Wersja: 1.0 · Data: 11.10.2026 · Zakres: MVP

## 1. Cel

Aplikacja webowa do szybkiego obliczania rozdziału przepływu wody między równoległe gałęzie oraz doboru dodatkowych oporów i przybliżonych średnic zwężek, pozwalających uzyskać zadany udział procentowy każdej gałęzi.

Użytkownik zna przepływ całkowity i charakterystyki hydrauliczne gałęzi. Wprowadza wstępne oszacowanie spadku ciśnienia, a aplikacja wyznacza rzeczywisty wspólny spadek ciśnienia oraz przepływy w gałęziach.

## 2. Zakres i założenia

- Jeden rozdzielacz zasilający i jeden kolektor powrotny.
- Minimum dwie równoległe gałęzie; możliwość dodawania i usuwania kolejnych.
- Pomijane straty w rozdzielaczu i kolektorze. Wszystkie gałęzie mają wspólne ciśnienie na początku i wspólne ciśnienie na końcu.
- Przepływ ustalony, jednokierunkowy, woda jako ciecz nieściśliwa. Brak modelowania różnic wysokości, przepływu dwufazowego i kawitacji.
- Każda gałąź opisana pojedynczą charakterystyką Δpᵢ = kᵢ·Qᵢⁿⁱ; kᵢ > 0, nᵢ > 0.
- Charakterystyka obejmuje całą istniejącą gałąź; dobierana zwężka stanowi dodatkowy opór szeregowy. Należy unikać dwukrotnego uwzględniania istniejącej zwężki.
- Zakładki: „Rozpływ” i „Dobór zwężek”. Wspólne dane gałęzi i przepływu całkowitego.

Poza MVP: wielopoziomowe sieci, geometria rur i armatury, straty w kolektorach, charakterystyka pompy, wyznaczanie k i n z pomiarów, automatyczne właściwości wody zależne od temperatury, konta użytkowników i import/eksport Excela.

## 3. Dane i jednostki

W MVP obowiązują stałe jednostki, widoczne przy każdym polu:

| Dane | Jednostka / reguła |
|---|---|
| Przepływ całkowity Qwe i przepływy gałęzi | l/min |
| Spadek ciśnienia Δp | kPa |
| Współczynnik k gałęzi | kPa/(l/min)ⁿ; zgodny z n danej gałęzi |
| Wykładnik n | bezwymiarowy, wartość początkowa 2 |
| Udział docelowy | % przepływu całkowitego |
| Średnica otworu i średnica wewnętrzna rury | mm |
| Gęstość wody ρ | kg/m³, wartość początkowa 1000, edytowalna |
| Efektywny współczynnik przepływu Ceff | bezwymiarowy; początkowo 0,61, edytowalny |

Wzory geometryczne zwężek liczone są w SI: Q[m³/s] = Q[l/min]/60000, Δp[Pa] = 1000·Δp[kPa]. k gałęzi pozostaje związane z jednostkami l/min i kPa. Aplikacja obsługuje przecinek i kropkę dziesiętną.

## 4. Zakładka „Rozpływ”

### Wejście

- Przepływ całkowity Qwe > 0.
- Wstępne oszacowanie Δp₀ > 0, z etykietą „Wstępne Δp — punkt startowy obliczeń”.
- Edytowalna tabela: nazwa gałęzi, k, n; przyciski dodawania, usuwania i „Oblicz rozpływ”.

Δp₀ nie jest drugim narzuconym warunkiem hydraulicznym. Przy znanym Qwe i znanych charakterystykach końcowe Δp wynika z rozwiązania. Zmiana poprawnego Δp₀ ma wpływać wyłącznie na proces numeryczny, nie na wynik.

### Model i obliczenia

Bilans przepływu, odpowiadający pierwszemu prawu Kirchhoffa:

ΣQᵢ = Qwe.

Dla gałęzi równoległych wspólna różnica ciśnienia wynosi:

Δp = kᵢ·Qᵢⁿⁱ, zatem Qᵢ(Δp) = (Δp/kᵢ)^(1/nᵢ).

Solver znajduje dodatni pierwiastek funkcji:

f(Δp) = Σ(Δp/kᵢ)^(1/nᵢ) − Qwe.

Zalecana implementacja: bisekcja, dolna granica 0, górna granica początkowo Δp₀, zwiększana dwukrotnie do objęcia pierwiastka. Ustawić limit poszukiwania przedziału i iteracji oraz kontrolę wartości skończonych. Sukces wymaga względnego błędu bilansu przepływu ≤ 10⁻⁶. Przekroczenie limitu lub zakresu liczbowego daje czytelny komunikat o braku wyniku.

### Wynik

- Wspólne Δp układu.
- Tabela: gałąź, Qᵢ, udział 100·Qᵢ/Qwe, Δpᵢ.
- Suma przepływów i błąd bilansu.
- Prosty schemat rozdzielacz–gałęzie–kolektor z wartościami Qᵢ i procentami; bez edytora sieci.
- Przycisk przejścia do doboru zwężek z zachowaniem danych.

## 5. Zakładka „Dobór zwężek”

### Wejście i przebieg

1. Użytkownik korzysta z tych samych gałęzi, Qwe, k i n.
2. Przypisuje każdej gałęzi docelowy udział sᵢ w procentach.
3. Podaje średnicę wewnętrzną rury Dᵢ dla gałęzi wymagających zwężki.
4. Opcjonalnie zmienia wspólną gęstość wody i efektywny współczynnik przepływu; współczynnik można nadpisać dla konkretnej gałęzi.
5. Wybiera „Dobierz zwężki”.

Każdy udział musi być większy od zera, a suma równa 100% z tolerancją 0,01 punktu procentowego. Przy różnicy mieszczącej się w tolerancji udziały są normalizowane do dokładnie 100% i ta korekta jest widoczna. Większa różnica blokuje obliczenia. Udział 0% wymaga zamknięcia gałęzi i pozostaje poza MVP.

### Wyznaczenie dodatkowego oporu

Qᵢ* = (sᵢ/100)·Qwe.

Istniejąca gałąź przy przepływie docelowym wymaga:

Δpᵢ,baza = kᵢ·(Qᵢ*)ⁿⁱ.

Aplikacja przyjmuje minimalne wspólne ciśnienie umożliwiające uzyskanie docelowego rozdziału przez dodawanie oporów:

Δp* = maxᵢ(Δpᵢ,baza).

Wymagany dodatkowy opór każdej gałęzi:

Δpᵢ,zw = Δp* − Δpᵢ,baza ≥ 0.

Gałęzie o maksymalnym Δpᵢ,baza nie wymagają zwężki. Do porównania z zerem stosować tolerancję numeryczną; małe ujemne wartości wynikające z zaokrągleń traktować jako zero.

### Przybliżona średnica zwężki

MVP używa uproszczonego modelu dodatkowej straty:

Q = Ceff·A·√(2·Δpzw/ρ), A = π·d²/4.

Stąd, dla Δpzw > 0:

d = √[4·Q / (π·Ceff·√(2·Δpzw/ρ))].

Q, Δpzw, ρ i d we wzorze mają jednostki SI. Wynik d prezentowany jest w mm.

Ceff jest efektywnym współczynnikiem przyjętym dla dodatkowej, trwałej straty ciśnienia. Wartość 0,61 stanowi założenie startowe do oszacowania. Nie jest uniwersalną charakterystyką dowolnej zwężki. W interfejsie wynik ma etykietę „Przybliżona średnica otworu” i krótką informację o przyjętym Ceff.

Nie należy podstawiać do bilansu gałęzi różnicy ciśnienia z króćców kryzy pomiarowej bez uwzględnienia odzysku ciśnienia. Wzór kryzy pomiarowej z poprawką β = d/D opisuje inne warunki pomiaru i nie jest w MVP deklarowany jako model trwałej straty ani obliczenie zgodne z ISO 5167. Dᵢ służy w tym modelu do kontroli geometrii.

Dla Δpzw = 0 wyświetlić „Zwężka niewymagana”, bez obliczania d. Jeżeli d ≥ Dᵢ, pokazać „Brak poprawnej geometrii w przyjętym modelu” i zachować wynik wymaganego dodatkowego oporu. Nie przycinać d automatycznie do Dᵢ.

### Wynik i sprawdzenie

Tabela: gałąź, udział docelowy, Qᵢ*, Δpᵢ,baza, Δpᵢ,zw, Ceff, przybliżone d i status. Nad tabelą: wymagane wspólne Δp* oraz porównanie z Δp układu bez dodatkowych zwężek.

Dla poprawnych wyników obliczyć również kᵢ,zw = Δpᵢ,zw/(Qᵢ*)² w jednostkach kPa/(l/min)² i sprawdzić rozpływ dla charakterystyk złożonych:

Δp = kᵢ·Qᵢⁿⁱ + kᵢ,zw·Qᵢ².

Nie sumować współczynników k gałęzi i zwężki jako jednego k, chyba że nᵢ = 2. Sprawdzenie ma potwierdzić zgodność udziałów z celami w przyjętym modelu; nie stanowi walidacji fizycznej wykonanej zwężki.

## 6. Interfejs i zachowanie

- Polski interfejs, dwie zakładki, czytelne tabele i konsekwentne oznaczenia jednostek.
- Dane wspólne zachowane przy przełączaniu zakładek.
- Obliczenia uruchamiane przyciskiem; zmiana wejścia oznacza poprzednie wyniki jako nieaktualne.
- Błędy wskazywane przy konkretnym polu, bez kasowania danych użytkownika.
- Wyniki prezentowane zwykle z trzema cyframi znaczącymi; obliczenia i walidacja korzystają z pełnej precyzji.
- Obliczenia po stronie przeglądarki; bez backendu i logowania. Bieżące dane mogą być przechowywane w localStorage, z przyciskiem „Wyczyść dane”.
- Układ przede wszystkim desktopowy; na małym ekranie tabela może przewijać się poziomo.

## 7. Walidacja

- Wszystkie wymagane wartości muszą być skończonymi liczbami.
- Qwe, Δp₀, k, n, ρ i wymagane D muszą być dodatnie; 0 < Ceff ≤ 1 w przyjętym uproszczeniu.
- Nazwy gałęzi generowane automatycznie, z możliwością edycji.
- Brak automatycznej zmiany k przy zmianie n; użytkownik odpowiada za spójną parę parametrów charakterystyki.
- Niepoprawne dane blokują tylko zależne obliczenia. Brak D nie blokuje podstawowego rozpływu.
- Nie prezentować nieudanego ani nieaktualnego obliczenia jako poprawnego wyniku.

## 8. Kryteria akceptacji

| Scenariusz | Oczekiwany wynik |
|---|---|
| Dwie identyczne gałęzie: k = 1, n = 2, Qwe = 10 l/min | Q₁ = Q₂ = 5 l/min; udziały 50/50%; Δp = 25 kPa |
| k₁ = 1, k₂ = 4, oba n = 2; Qwe = 9 l/min | Q₁ = 6, Q₂ = 3 l/min; Δp = 36 kPa |
| Zmiana Δp₀ z 1 na 1000 kPa dla powyższego układu | Ten sam końcowy wynik w tolerancji solvera |
| Dwie identyczne gałęzie: k = 1, n = 2; Qwe = 10; cel 70/30% | Q* = 7 i 3; Δp* = 49; dodatkowe straty 0 i 40 kPa |
| Powyższy dobór, ρ = 1000 i Ceff = 0,61 | Gałąź 1 bez zwężki; przybliżony otwór gałęzi 2 około 3,42 mm |
| Ponowne rozwiązanie modelu ze zwężkami dla celu 70/30% | Udziały zgodne z celem do 0,01 punktu procentowego |
| Suma udziałów 95%, k ≤ 0, n ≤ 0 lub pole nieliczbowe | Jasny komunikat; brak nowego wyniku |
| d ≥ D | Status braku poprawnej geometrii; brak automatycznego ograniczania średnicy |
| Zmiana k po obliczeniu i przełączenie zakładki | Dane zachowane; zależne wyniki oznaczone jako nieaktualne |

## 9. Definicja ukończenia MVP

Obie zakładki działają dla wspólnych danych. Solver spełnia bilans przepływu, dobór wyznacza cele procentowe, wymagane Δp i dodatkowe opory, a przybliżone średnice mają jasno wskazany model. Scenariusze akceptacyjne przechodzą, błędy wejścia są obsłużone, a interfejs pozwala wykonać obliczenia bez konfiguracji technicznej.

## 10. Źródło i decyzja dotycząca modelu kryzy

Dokumentacja Oak Ridge National Laboratory MEASUR opisuje korektę współczynnika kryzy przez 1/√(1−β⁴): https://industrialresources.ornl.gov/measur/suite/docs/group__flow__calculations__adjusted__discharge__coefficient__formula

Decyzja projektowa MVP: zastosować jawnie uproszczony, efektywny model dodatkowej straty i traktować średnicę jako oszacowanie. Dokładna korelacja trwałej straty konkretnego typu kryzy pozostaje rozszerzeniem po MVP.
