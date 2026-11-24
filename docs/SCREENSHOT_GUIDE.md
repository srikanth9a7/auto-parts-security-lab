# Capture your own Chrome and VS Code screenshots (all three rubric sections)

Run the application in VS Code using `npm start` and open **http://127.0.0.1:3000** in Chrome. Keep the **Chrome address bar** visible in browser screenshots to show the result was produced locally. Keep the **filename tab** visible when capturing code screenshots in VS Code.

Save screenshots in `evidence/`. Suggested screenshot names:

1. `Q1_SQL_Pseudocode.png` — the SQL lookup algorithm in `docs/PSEUDOCODE.md`.
2. `Q1_XSS_Pseudocode.png` — the receipt-rendering and CSP algorithms in `docs/PSEUDOCODE.md`.
3. `Q2_Prepared_SQL_Code.png` — the short `findPartsOrder()` method in `src/database.js`, including `WHERE order_code = ?`.
4. `Q2_Valid_Order_Chrome.png` — Chrome with `AZL-4418` returning **All-Season Wiper Blade Pair, $32.99**.
5. `Q2_SQL_Injection_Blocked_Chrome.png` — click **Insert SQL injection sample**, then **Find order**; show **No matching parts order**.
6. `Q3_Safe_DOM_Code.png` — the short `for (const value of lines)` loop and `paragraph.textContent = value` in `public/app.js`.
7. `Q3_XSS_Blocked_Chrome.png` — click **Insert XSS sample**, then **Create demo receipt**; show the payload as literal text and **No injected script executed**.
8. `Q3_CSP_Header_Code.png` — the `SECURITY_HEADERS` block in `server.js`, especially `script-src 'self'`.
9. `Automated_Tests_VSCode.png` — run `npm test` and screenshot the passing summary.
10. `GitHub_Repository_Chrome.png` — after GitHub push, show the public repo URL.

## Your APA 7 report outline

- Page 1: separate APA 7 title page.
- Introduction: explain the **unofficial AutoZone-inspired** fictional auto-parts scenario and the 100-point rubric.
- **20 points: pseudocode** — include small screenshots for the two defenses and explain every major decision.
- **50 points: SQL injection** — include the prepared-statement snippet and your actual local Chrome results (normal order and injection blocked).
- **30 points: XSS** — include the `textContent` snippet, CSP snippet, and your actual local Chrome receipt output.
- Short results discussion: what the tests demonstrate and why the demo is not a real card processor.
- APA references and GitHub repository/source-file links.

**Use screenshots from your own computer** for browser outputs. For code figures, include **only the relevant few lines** on a plain white background when embedding them into Word; explain them immediately below the image.

## GitHub commands (after local tests)

1. Create a **new, empty public** repository at https://github.com/new named `autozone-inspired-parts-security`. Do not initialize it with GitHub's README/license.
2. In your VS Code PowerShell terminal, from the extracted project folder:

```powershell
git init
git branch -M main
git add .
git commit -m "Add auto-parts SQL injection and XSS security lab"
git remote add origin https://github.com/srikanth9a7/autozone-inspired-parts-security.git
git push -u origin main
```

3. After the push succeeds, paste these links in the APA report:

- Repository: `https://github.com/srikanth9a7/autozone-inspired-parts-security`
- SQL source: `https://github.com/srikanth9a7/autozone-inspired-parts-security/blob/main/src/database.js`
- XSS source: `https://github.com/srikanth9a7/autozone-inspired-parts-security/blob/main/public/app.js`
- CSP source: `https://github.com/srikanth9a7/autozone-inspired-parts-security/blob/main/server.js`
- Pseudocode: `https://github.com/srikanth9a7/autozone-inspired-parts-security/blob/main/docs/PSEUDOCODE.md`

These URLs are examples of where the files **will be** after you successfully create and push your repository. They are not live yet.

Do not deploy this lab as a payment website. Publishing the source code is acceptable, provided it contains no private information or credentials.
