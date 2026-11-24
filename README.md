# AutoZone-Inspired Auto Parts Checkout — Security Project

**Unofficial student project. Not affiliated with, sponsored by, or endorsed by AutoZone.** This web application uses an auto-parts pickup example to demonstrate secure web programming. All item names, fitments, order codes, and prices are fictional teaching data. It **does not process real payments** or accept card details.

## Grading-rubric coverage (100 points)

| Assignment requirement | Points | Evidence in this project |
|---|---:|---|
| Pseudocode for securing online payment | 20 | `docs/PSEUDOCODE.md`: explicit SQL and XSS algorithms plus explanations |
| Code against SQL injection | 50 | `src/database.js` uses `WHERE order_code = ?` and bound parameters; `tests/security.test.js` proves injection strings do not alter results |
| Code to prevent cross-site scripting | 30 | `public/app.js` inserts data via `textContent`; `server.js` sets strict CSP headers; automated tests + Chrome demonstration |

## Run in VS Code on Windows

1. Extract this ZIP, then open the `autozone-inspired-parts-security` folder in VS Code.
2. Confirm **Node.js 22.13+** (or newer) is installed: `node --version`.
3. In **Terminal → New Terminal**, run `npm start`.
4. In Chrome, visit **http://127.0.0.1:3000**.
5. In a second terminal run `npm test` to execute the security checks.
6. Stop the local server with **Ctrl+C**.

No `npm install` is necessary. The SQLite module used here is included in Node.js 22.13+; some versions may print an ExperimentalWarning that is expected for this exercise.

## Three simple Chrome demonstrations

**A. Normal auto-parts order:** enter `AZL-4418`, then click **Find order**. The fictional **All-Season Wiper Blade Pair** should display with a **$32.99** demo total.

**B. SQL injection blocked:** click **Insert SQL injection sample** and **Find order**. The database should respond **No matching parts order** instead of returning a record through the injected `OR` expression.

**C. XSS blocked:** click **Insert XSS sample** and **Create demo receipt**. The HTML-looking note should appear **literally** in the receipt, while the green status still says **No injected script executed**.

## Project file guide

- `src/database.js`: database schema, fictional parts orders, parameterized SQL, receipts
- `src/validation.js`: validation of checkout fields
- `server.js`: HTTP routes, response limits, CSP headers
- `public/index.html`: unofficial auto-parts user interface
- `public/styles.css`: original, responsive interface
- `public/app.js`: browser interactions and safe text-only receipt rendering
- `tests/security.test.js`: automated checks of SQL injection, XSS protections, and pricing
- `docs/PSEUDOCODE.md`: detailed payment-system security pseudocode
- `docs/SCREENSHOT_GUIDE.md`: exactly which screenshots to capture, APA outline, and GitHub push commands
- `evidence/`: keep the screenshots you take on your own PC

## Important limits

This exercise demonstrates security properties for a small, local, **fictional** payment simulation. It is not an actual AutoZone page, and the project must not be used to collect payment or identifying data. It listens only at `127.0.0.1`. A real payment processor needs additional identity, authorization, HTTPS, CSRF, gateway, secret-management, availability, and PCI DSS controls.

## Useful APA references

OWASP Foundation. (n.d.). *SQL injection prevention cheat sheet*. https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

OWASP Foundation. (n.d.). *Cross site scripting prevention cheat sheet*. https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

OWASP Foundation. (n.d.). *Content security policy cheat sheet*. https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html

SQLite. (n.d.). *SQL parameters*. https://www.sqlite.org/lang_expr.html#parameters

Node.js. (n.d.). *SQLite*. https://nodejs.org/api/sqlite.html
