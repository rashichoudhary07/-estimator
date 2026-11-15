# Task: Material Quantity Estimator CLI

A small command-line tool that estimates construction material quantities.
The **same task, same prompt, same rules** are given to each agent harness:

- Hermes
- OpenClaw
- Gemini CLI

Goal: compare how well each one plans, writes code, tests, and recovers from errors.

---

## 1. Tech stack

- Node.js 18+ (no external dependencies)
- Built-in test runner: `node --test`
- Data stored in a local `history.json` file

## 2. Project structure (agent must create this)

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

## 3. Features

### 3.1 `concrete` command

```
node src/cli.js concrete --length 5 --width 4 --depth 0.15 --grade M20
```

Calculate:
- Wet volume = length x width x depth (m3)
- Dry volume = wet volume x 1.54
- Mix ratios: `M15 = 1:2:4`, `M20 = 1:1.5:3`, `M25 = 1:1:2`
- Cement volume = dry volume x cement part / sum of parts
- Cement bags (50 kg bag = 0.0347 m3), **always rounded up**
- Sand and aggregate volumes (m3, 2 decimals)

### 3.2 `bricks` command

```
node src/cli.js bricks --length 5 --height 3 --thickness 0.2 --openings 2
```

- `--openings` is total door/window area in m2 (optional, default 0)
- Brick with mortar = 0.2 x 0.1 x 0.1 m (500 bricks per m3)
- Net wall volume = (length x height - openings) x thickness
- Bricks needed = net volume x 500, rounded up

### 3.3 `history` command

- Every successful calculation is appended to `history.json` with a timestamp
- `node src/cli.js history` lists all saved estimates
- `node src/cli.js history --export csv` writes `history.csv`

### 3.4 Error handling

- Missing, negative, zero, or non-numeric input -> clear message, exit code 1
- Unknown grade or command -> clear message, exit code 1

## 4. Acceptance tests (must pass)

| # | Command | Expected |
|---|---------|----------|
| 1 | `concrete --length 5 --width 4 --depth 0.15 --grade M20` | wet 3.00 m3, dry 4.62 m3, cement 0.84 m3 = **25 bags**, sand **1.26 m3**, aggregate **2.52 m3** |
| 2 | `bricks --length 5 --height 3 --thickness 0.2 --openings 2` | **1300 bricks** |
| 3 | `concrete --length -5 --width 4 --depth 0.15 --grade M20` | error message, exit code 1 |
| 4 | `concrete --length 5 --width 4 --depth 0.15 --grade M99` | error message, exit code 1 |
| 5 | run #1 then `history` | shows 1 entry with timestamp |
| 6 | `history --export csv` | `history.csv` created with header row |
| 7 | `node --test` | at least 6 unit tests, all passing |

## 5. Rules for a fair comparison

1. Use a **fresh empty folder** for each agent (`test-hermes/`, `test-openclaw/`, `test-gemini/`).
2. Paste the **exact same prompt** (section 6) into each. No extra hints.
3. Use the **same underlying model** if the harness allows it. If not, note which model each used.
4. **Do not edit code by hand.** Only reply to the agent in chat.
5. If the agent asks a question, answer briefly and log it as an extra interaction.
6. Stop when all tests pass or after **15 interactions**, whichever comes first.
7. Run the acceptance tests yourself at the end. Do not trust the agent's claim.

## 6. Prompt to give each agent

```
Build a Node.js CLI project called "estimator" in the current folder, following
the spec in task.md exactly (features, folder structure, and acceptance tests).
Use no external dependencies. Write unit tests with node --test. Run the tests
and the acceptance commands yourself, fix any failures, and finish with a short
README.md explaining usage. Tell me when everything passes.
```

(Place `task.md` in each test folder before starting.)

## 7. Scoring (0-5 each)

| Criteria | Hermes | OpenClaw | Gemini CLI |
|----------|:------:|:--------:|:----------:|
| Followed folder structure | | | |
| Calculations correct (tests 1-2) | | | |
| Error handling (tests 3-4) | | | |
| History + CSV export (tests 5-6) | | | |
| Wrote meaningful unit tests (test 7) | | | |
| Ran and fixed its own failures | | | |
| Code readability | | | |
| README quality | | | |
| **Total /40** | | | |

## 8. Run log (fill during testing)

| Metric | Hermes | OpenClaw | Gemini CLI |
|--------|--------|----------|------------|
| Model used | | | |
| Setup difficulty (1-5) | | | |
| Time to finish (min) | | | |
| Number of interactions | | | |
| Acceptance tests passed (of 7) | | | |
| Errors / crashes in the tool | | | |
| Tokens / cost (if shown) | | | |
| Needed manual rescue? (Y/N) | | | |

## 9. Observations

- **Hermes:**
- **OpenClaw:**
- **Gemini CLI:**

**Winner and why:**

---

### Optional stretch round

Once all three finish, give each the same follow-up and compare again:

> Add a `footing` command (length, width, depth, count) and a `--unit ft` flag that converts feet to metres before calculating. Add tests.
