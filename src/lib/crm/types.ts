import type { customers, enquiries, quotations, suppliers, tours } from "@/db/schema";

export type CustomerRecord = typeof customers.$inferSelect;
export type SupplierRecord = typeof suppliers.$inferSelect;
export type QuotationRecord = typeof quotations.$inferSelect;
export type EnquiryRow = typeof enquiries.$inferSelect;
export type TourRow = typeof tours.$inferSelect;
