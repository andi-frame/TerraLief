ALTER TABLE "shelter_populations" ADD COLUMN "adults" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shelter_populations" ADD COLUMN "mobility" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shelter_populations" ADD COLUMN "chronic" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shelter_populations" ADD COLUMN "pregnant" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shelter_populations" ADD COLUMN "infants" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shelters" ADD COLUMN "address" varchar(255) DEFAULT '' NOT NULL;