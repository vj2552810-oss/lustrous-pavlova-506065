import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

// Private enquiry log. This data is NEVER exposed through any public endpoint.
export const enquiries = pgTable(
  "enquiries",
  {
    id: serial("id").primaryKey(),
    kind: varchar("kind", { length: 20 }).notNull(), // "trip" | "contact" | "hotel"
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    destination: varchar("destination", { length: 120 }),
    departureCity: varchar("departure_city", { length: 120 }),
    travelDates: varchar("travel_dates", { length: 120 }),
    travelers: integer("travelers"),
    budget: varchar("budget", { length: 60 }),
    tripType: varchar("trip_type", { length: 60 }),
    subject: varchar("subject", { length: 160 }),
    message: text("message"),
    /** Which tour page the enquiry came from (tour enquiries only). */
    tourSlug: varchar("tour_slug", { length: 140 }),
    /** Unique public enquiry/booking reference, e.g. PVH-ENQ-4F9K2P */
    code: varchar("code", { length: 24 }),
    /**
     * Pipeline status: new_enquiry | quotation_sent | awaiting_approval |
     * awaiting_payment | awaiting_supplier_confirmation | confirmed |
     * cancelled | completed | contacted | quoted | closed
     */
    status: varchar("status", { length: 40 }).default("new_enquiry").notNull(),
    adminNote: text("admin_note"),
    customerId: integer("customer_id"),
    supplierId: integer("supplier_id"),
    supplierName: varchar("supplier_name", { length: 160 }),
    supplierConfirmed: boolean("supplier_confirmed").default(false).notNull(),
    adults: integer("adults"),
    children: integer("children"),
    hotelCategory: varchar("hotel_category", { length: 60 }),
    originCity: varchar("origin_city", { length: 120 }),
    subtotalMinor: integer("subtotal_minor"),
    taxesMinor: integer("taxes_minor"),
    totalMinor: integer("total_minor"),
    currency: varchar("currency", { length: 3 }).default("INR").notNull(),
    paymentStatus: varchar("payment_status", { length: 30 }).default("not_collected").notNull(),
    transactionId: varchar("transaction_id", { length: 120 }),
    quoteValidUntil: timestamp("quote_valid_until", { withTimezone: true }),
    quotationId: integer("quotation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("enquiries_email_idx").on(t.email),
    index("enquiries_status_idx").on(t.status),
    index("enquiries_code_idx").on(t.code),
  ],
);

/**
 * Guest hotel bookings — no user accounts. Status values:
 *  demo_request        demo mode: a request only, no payment, never "confirmed"
 *  request_received    live provider but online payment not configured yet
 *  pending_payment     checkout session created, awaiting payment
 *  paid                payment captured, provider confirmation in progress
 *  confirmed           provider returned a real confirmation
 *  confirmation_failed provider rejected/failed after payment (refund attempted)
 *  refunded            payment returned to the guest
 *  cancelled           cancelled before/without payment
 */
export const hotelBookings = pgTable(
  "hotel_bookings",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 20 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    mode: varchar("mode", { length: 8 }).notNull(), // "demo" | "live"
    provider: varchar("provider", { length: 80 }).notNull(),

    hotelId: varchar("hotel_id", { length: 120 }).notNull(),
    hotelName: varchar("hotel_name", { length: 160 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    roomId: varchar("room_id", { length: 120 }).notNull(),
    roomName: varchar("room_name", { length: 160 }).notNull(),
    checkIn: varchar("check_in", { length: 10 }).notNull(),
    checkOut: varchar("check_out", { length: 10 }).notNull(),
    nights: integer("nights").notNull(),
    guests: integer("guests").notNull(),
    rooms: integer("rooms").notNull(),
    breakfastIncluded: boolean("breakfast_included").default(false).notNull(),

    guestName: varchar("guest_name", { length: 120 }).notNull(),
    guestEmail: varchar("guest_email", { length: 200 }).notNull(),
    guestPhone: varchar("guest_phone", { length: 30 }).notNull(),
    specialRequests: text("special_requests"),

    currency: varchar("currency", { length: 3 }).default("INR").notNull(),
    nightlyPriceMinor: integer("nightly_price_minor").notNull(),
    subtotalMinor: integer("subtotal_minor").notNull(),
    taxesMinor: integer("taxes_minor").notNull(),
    totalMinor: integer("total_minor").notNull(),
    cancellationLabel: varchar("cancellation_label", { length: 200 }).notNull(),
    cancellationTerms: text("cancellation_terms").notNull(),

    paymentProvider: varchar("payment_provider", { length: 40 }),
    paymentStatus: varchar("payment_status", { length: 32 }).default("not_collected").notNull(),
    checkoutSessionId: varchar("checkout_session_id", { length: 120 }),
    paymentIntentId: varchar("payment_intent_id", { length: 120 }),
    refundId: varchar("refund_id", { length: 120 }),

    providerBookingId: varchar("provider_booking_id", { length: 120 }),
    confirmationCode: varchar("confirmation_code", { length: 120 }),
    failureReason: text("failure_reason"),

    emailStatus: varchar("email_status", { length: 32 }).default("not_sent").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("hotel_bookings_reference_unique").on(t.reference), index("hotel_bookings_guest_idx").on(t.guestEmail)],
);

/** Audit trail for every status change and provider/payment callback. */
export const hotelBookingEvents = pgTable(
  "hotel_booking_events",
  {
    id: serial("id").primaryKey(),
    bookingId: integer("booking_id")
      .notNull()
      .references(() => hotelBookings.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 60 }).notNull(),
    detail: text("detail"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("hotel_booking_events_booking_idx").on(t.bookingId)],
);

/** Deduplicates payment-gateway webhooks so a retry can't double-confirm. */
export const paymentEvents = pgTable(
  "payment_events",
  {
    id: serial("id").primaryKey(),
    eventId: varchar("event_id", { length: 120 }).notNull(),
    type: varchar("type", { length: 80 }).notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("payment_events_event_unique").on(t.eventId)],
);


/**
 * Tour Management System.
 * One reusable table drives domestic tours, international tours and special
 * packages — every destination page is rendered from this record.
 */
export const tours = pgTable(
  "tours",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 140 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(), // domestic | international | special
    city: varchar("city", { length: 160 }).default("").notNull(),
    country: varchar("country", { length: 120 }).notNull(),
    continent: varchar("continent", { length: 80 }).notNull(),
    summary: text("summary").notNull(),
    description: text("description").default("").notNull(),
    durationDays: integer("duration_days").notNull(),
    durationNights: integer("duration_nights").notNull(),
    /** Only shown to guests when priceVerified is true — otherwise "Request a Quote". */
    priceFromINR: integer("price_from_inr"),
    priceVerified: boolean("price_verified").default(false).notNull(),
    heroImage: text("hero_image").notNull(),
    heroImageAlt: text("hero_image_alt").default("").notNull(),
    gallery: jsonb("gallery").$type<string[]>().default([]).notNull(),
    highlights: jsonb("highlights").$type<string[]>().default([]).notNull(),
    itinerary: jsonb("itinerary").$type<{ day: number; title: string; description: string }[]>().default([]).notNull(),
    inclusions: jsonb("inclusions").$type<string[]>().default([]).notNull(),
    exclusions: jsonb("exclusions").$type<string[]>().default([]).notNull(),
    travelTips: jsonb("travel_tips").$type<string[]>().default([]).notNull(),
    styles: jsonb("styles").$type<string[]>().default([]).notNull(),
    bestTime: varchar("best_time", { length: 160 }).default("").notNull(),
    seasonMonths: jsonb("season_months").$type<number[]>().default([]).notNull(),
    published: boolean("published").default(true).notNull(),
    featured: boolean("featured").default(false).notNull(),
    sortOrder: integer("sort_order").default(100).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("tours_slug_unique").on(t.slug),
    index("tours_type_idx").on(t.type),
    index("tours_published_idx").on(t.published),
  ],
);

/** Staff-only sessions for the tour manager. Customers never create accounts. */
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: serial("id").primaryKey(),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    label: varchar("label", { length: 80 }).default("admin").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("admin_sessions_token_unique").on(t.tokenHash)],
);


/** CRM profiles. Created from enquiries; guests never log in. */
export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    phone: varchar("phone", { length: 30 }).notNull(),
    city: varchar("city", { length: 120 }),
    preferences: text("preferences"),
    notes: text("notes"),
    source: varchar("source", { length: 60 }).default("website").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("customers_email_unique").on(t.email), index("customers_phone_idx").on(t.phone)],
);

/** Hotels, resorts, operators and partners — managed by staff only. */
export const suppliers = pgTable(
  "suppliers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    category: varchar("category", { length: 40 }).notNull(),
    contactName: varchar("contact_name", { length: 120 }),
    email: varchar("email", { length: 200 }),
    phone: varchar("phone", { length: 30 }),
    location: varchar("location", { length: 160 }),
    services: jsonb("services").$type<string[]>().default([]).notNull(),
    agreedRate: varchar("agreed_rate", { length: 160 }),
    commissionPercent: integer("commission_percent"),
    agreementNotes: text("agreement_notes"),
    /** unverified | verified | suspended — staff decision, never guest-facing */
    verificationStatus: varchar("verification_status", { length: 20 }).default("unverified").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("suppliers_category_idx").on(t.category)],
);

/** Quotations generated by staff. Amounts are stored server-side only. */
export const quotations = pgTable(
  "quotations",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 24 }).notNull(),
    enquiryId: integer("enquiry_id").references(() => enquiries.id, { onDelete: "set null" }),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    customerEmail: varchar("customer_email", { length: 200 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 30 }).notNull(),
    destination: varchar("destination", { length: 160 }).notNull(),
    travelDates: varchar("travel_dates", { length: 120 }).notNull(),
    travelers: integer("travelers").notNull(),
    hotelDetails: text("hotel_details"),
    transportDetails: text("transport_details"),
    inclusions: jsonb("inclusions").$type<string[]>().default([]).notNull(),
    exclusions: jsonb("exclusions").$type<string[]>().default([]).notNull(),
    subtotalMinor: integer("subtotal_minor").notNull(),
    taxesMinor: integer("taxes_minor").default(0).notNull(),
    totalMinor: integer("total_minor").notNull(),
    currency: varchar("currency", { length: 3 }).default("INR").notNull(),
    paymentTerms: text("payment_terms"),
    cancellationPolicy: text("cancellation_policy"),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("quotations_code_unique").on(t.code), index("quotations_enquiry_idx").on(t.enquiryId)],
);

/** Structured audit trail. Never stores secrets (see src/lib/security/log.ts). */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    event: varchar("event", { length: 60 }).notNull(),
    actor: varchar("actor", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 40 }),
    entityId: varchar("entity_id", { length: 60 }),
    detail: text("detail"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("audit_logs_event_idx").on(t.event), index("audit_logs_created_idx").on(t.createdAt)],
);

/** Newsletter sign-ups — email only, no extra personal data collected. */
export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 200 }).notNull(),
    source: varchar("source", { length: 60 }).default("website").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("newsletter_email_unique").on(t.email)],
);
