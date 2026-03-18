---
name: core-string-formats
description: Zod string validations and top-level string format validators
---

# String Formats

Zod 4 promotes string format validators to top-level functions. These are standalone schema types, not methods on `z.string()`.

## String Validations

```ts
const s = z.string();

// length constraints
s.min(5);
s.max(100);
s.length(10);

// pattern matching
s.regex(/^[a-z]+$/);
s.startsWith("https://");
s.endsWith(".com");
s.includes("@");

// case validation
s.uppercase();  // validates input is uppercase
s.lowercase();  // validates input is lowercase

// transforms (modify the value)
s.trim();
s.toLowerCase();
s.toUpperCase();
s.normalize();  // Unicode normalization
```

## Top-Level String Format Validators

These are independent schema types, not methods on `z.string()`.

### Email

```ts
z.email();
z.email({ error: "Invalid email" });

// custom regex pattern
z.email({ pattern: z.regexes.html5Email }); // less strict HTML5 pattern
```

### UUID

```ts
z.uuid();
z.uuidv4();  // UUID v4 only
z.uuidv7();  // UUID v7 only
z.uuid({ version: "v4" }); // equivalent to z.uuidv4()
```

### URL

```ts
z.url();

// HTTP/HTTPS only
z.httpUrl();

// with constraints
z.url({
  hostname: /^example\.com$/,
  protocol: /^https$/,
});
```

### IP Addresses

```ts
z.ipv4();
z.ipv6();
z.cidrv4();  // CIDR notation
z.cidrv6();
```

### Date/Time (ISO 8601)

```ts
z.iso.date();      // "2024-01-15"
z.iso.time();      // "14:30:00"
z.iso.datetime();  // "2024-01-15T14:30:00Z"
z.iso.duration();  // "P1Y2M3D"

// datetime options
z.iso.datetime({ offset: true });    // allow timezone offsets
z.iso.datetime({ local: true });     // allow no timezone
z.iso.datetime({ precision: 3 });    // millisecond precision
```

### Other Formats

```ts
z.hostname();   // RFC 1123 hostname
z.emoji();      // single emoji character
z.nanoid();     // NanoID
z.cuid();       // CUID
z.cuid2();      // CUID2
z.ulid();       // ULID
z.jwt();        // JSON Web Token
z.e164();       // E.164 phone number

// encoding formats
z.base64();
z.base64url();
z.hex();

// MAC address
z.mac();         // any format
z.mac({ separator: ":" });
z.mac({ separator: "-" });

// hash digests
z.hash("md5");
z.hash("sha1");
z.hash("sha256");
z.hash("sha512");
```

### Custom String Formats

Register reusable string format validators:

```ts
const slugFormat = z.stringFormat("slug", (val) => /^[a-z0-9-]+$/.test(val));
// use as: schema.check(slugFormat)
```

<!--
Source references:
- https://github.com/colinhacks/zod/blob/main/packages/docs/content/api.mdx
-->
