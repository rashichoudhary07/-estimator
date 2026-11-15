# Estimator

A command-line tool that estimates construction material quantities: concrete mixes and brick walls.

Built with Node.js 18+ and **no external dependencies**. Uses the built-in `node --test` runner for unit tests.

## Project structure

```
estimator/
├── package.json
├── README.md
├── src/
│   ├── cli.js          # entry point, parses commands
│   ├── concrete.js     # concrete + mix calculations
│   ├── bricks.js       # brick wall calculations
│   └── history.js      # save / list / export
└── test/
    └── estimator.test.js
```

## Commands

### Concrete

```bash
node src/cli.js concrete --length 5 --width 4 --depth 0.15 --grade M20
```

Calculates concrete quantities for a rectangular slab.

| Flag | Description |
|------|-------------|
| `--length` | Slab length in metres (positive number) |
| `--width`  | Slab width in metres (positive number) |
| `--depth`  | Slab depth in metres (positive number) |
| `--grade`  | Concrete grade: `M15` (1:2:4), `M20` (1:1.5:3), or `M25` (1:1:2) |

Output:
```
Wet volume: 3.00 m3
Dry volume: 4.62 m3
Cement volume: 0.84 m3 = 25 bags
Sand: 1.26 m3
Aggregate: 2.52 m3
```

Calculation:
- Wet volume = length × width × depth
- Dry volume = wet volume × 1.54
- Cement volume = dry volume × (cement part ÷ sum of parts)
- Cement bags = cement volume ÷ 0.0347 m³ per 50 kg bag, **rounded up**
- Sand and aggregate volumes rounded to 2 decimals

### Bricks

```bash
node src/cli.js bricks --length 5 --height 3 --thickness 0.2 --openings 2
```

Calculates the number of bricks needed for a wall.

| Flag | Description |
|------|-------------|
| `--length` | Wall length in metres (positive number) |
| `--height` | Wall height in metres (positive number) |
| `--thickness` | Wall thickness in metres (positive number) |
| `--openings` | Total door/window area in m² (optional, default 0) |

Output:
```
Net wall volume: 2.60 m3
Bricks needed: 1300
```

Calculation:
- Net wall volume = (length × height − openings) × thickness
- Bricks needed = net wall volume × 500 (brick with mortar = 0.2 × 0.1 × 0.1 m), rounded up

### History

```bash
node src/cli.js history                  # list all saved estimates
node src/cli.js history --export csv     # export to history.csv
```

Every successful calculation is appended to `history.json` with a timestamp.

## Error handling

- Missing, negative, zero, or non-numeric input → clear error message, exit code 1
- Unknown grade or command → clear error message, exit code 1

## Running tests

```bash
node --test
```

The project includes 15 unit tests covering concrete calculations, brick calculations, grade validation, error handling, and history/CSV export.

## Usage example

```bash
node src/cli.js concrete --length 5 --width 4 --depth 0.15 --grade M20
# Wet volume: 3.00 m3
# Dry volume: 4.62 m3
# Cement volume: 0.84 m3 = 25 bags
# Sand: 1.26 m3
# Aggregate: 2.52 m3

node src/cli.js history --export csv
# Exported 1 estimate(s) to history.csv
```
