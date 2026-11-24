# Pseudocode for protecting an online auto-parts payment simulation

**Scenario.** A student-created, unofficial AutoZone-inspired auto-parts pickup checkout displays fictional parts orders and a simulated receipt. There is **no real payment transaction** and no card-data collection. The same protection patterns would matter in a real payment application, alongside several additional controls.

## 1. SQL injection protection: fixed query and bound input

```text
PROCEDURE LOOK_UP_PARTS_ORDER(untrustedOrderCode)
    IF length(untrustedOrderCode) > 100 THEN
        RETURN "Order code is too long"
    END IF

    command := DATABASE.PREPARE(
        "SELECT order_code, part_name, vehicle_note, pickup_counter, total_cents
         FROM parts_orders WHERE order_code = ?"
    )
    order := command.GET_WITH_BOUND_PARAMETER(untrustedOrderCode)

    IF order is missing THEN
        RETURN "No matching parts order"
    END IF
    RETURN order
END PROCEDURE
```

**Explanation.** The `?` symbol stands for a value that the database driver binds separately. The input `AZL-4418' OR '1'='1' --` remains an exact, unmatched order-code string; it cannot change the meaning of `WHERE order_code = ?`. The lookup uses a length limit as an additional input-safety measure. Parameterization, not the length limit, is what prevents SQL injection.

## 2. A simulated checkout with a server-controlled total

```text
PROCEDURE CREATE_PICKUP_RECEIPT(checkoutInput)
    VALIDATE the order code format, customer name, and note length
    order := LOOK_UP_PARTS_ORDER(checkoutInput.orderCode)
    IF no order exists THEN RETURN "Order not found"

    total := order.total_cents  // Read from the server-side database
    statement := DATABASE.PREPARE(
        "INSERT INTO demo_receipts
         (order_code, buyer_name, pickup_note, total_cents)
         VALUES (?, ?, ?, ?)"
    )
    statement.RUN_WITH_BOUND_PARAMETERS(
        order.order_code, checkoutInput.buyerName, checkoutInput.pickupNote, total
    )
    RETURN receipt data in JSON format
END PROCEDURE
```

**Explanation.** The client cannot replace a purchase total with a cheaper price because the server uses its own database record. Prepared statements are also used during receipt creation.

## 3. Cross-site scripting protection: text rendering and CSP

```text
PROCEDURE DISPLAY_PICKUP_RECEIPT(receipt)
    CLEAR the old receipt display
    FOR EACH value IN receipt fields DO
        paragraph := CREATE_ELEMENT("p")
        paragraph.TEXT_CONTENT := value   // Never interpret untrusted HTML
        ADD paragraph TO receipt display
    END FOR
END PROCEDURE

PROCEDURE APPLY_SECURITY_HEADERS(response)
    SET Content-Security-Policy TO
        "default-src 'self'; script-src 'self'; object-src 'none';
         base-uri 'none'; frame-ancestors 'none'"
    SET X-Content-Type-Options TO "nosniff"
END PROCEDURE
```

**Explanation.** A malicious-looking pickup note containing an `<img onerror=...>` string becomes visible text, not a newly created image element. A restrictive Content Security Policy reduces the chances that unsafe inline code can run if a separate rendering bug is introduced. CSP is an extra barrier, not a replacement for safe rendering.

## 4. What a live payment system would also need

This project deliberately **does not** implement real payment processing. A deployed auto-parts payment application would also require: HTTPS, a compliant payment gateway with tokenized payment data, authenticated customer accounts, server-side order authorization, CSRF defenses, payment idempotency and anti-replay controls, secure secret storage, monitoring/audit logs, and privacy and PCI DSS controls where applicable. Never enter actual card or personal information into the lab.
