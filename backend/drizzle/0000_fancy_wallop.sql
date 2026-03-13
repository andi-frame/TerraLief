CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "important_point_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"important_point_id" uuid NOT NULL,
	"file_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"route_id" uuid NOT NULL,
	"is_manual_start" boolean DEFAULT false NOT NULL,
	"start_label" varchar(255),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "important_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"category" varchar(50) DEFAULT 'tip' NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "route_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"point_order" integer NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_lat" real NOT NULL,
	"start_lng" real NOT NULL,
	"target_shelter_id" uuid NOT NULL,
	"name" varchar(100),
	"distance_km" real,
	"eta_min" integer,
	"vehicle_type" varchar(50),
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shelter_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shelter_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"age" integer,
	"condition" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shelter_needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shelter_id" uuid NOT NULL,
	"item" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"fulfilled" integer DEFAULT 0 NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shelter_populations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shelter_id" uuid NOT NULL,
	"male" integer DEFAULT 0 NOT NULL,
	"female" integer DEFAULT 0 NOT NULL,
	"children" integer DEFAULT 0 NOT NULL,
	"elderly" integer DEFAULT 0 NOT NULL,
	"medical" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shelters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"disaster_type" varchar(50) NOT NULL,
	"managed_by" varchar(255),
	"capacity_status" varchar(50) DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"refresh_token" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "important_point_files" ADD CONSTRAINT "important_point_files_important_point_id_important_points_id_fk" FOREIGN KEY ("important_point_id") REFERENCES "public"."important_points"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "important_point_files" ADD CONSTRAINT "important_point_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "important_points" ADD CONSTRAINT "important_points_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "route_points" ADD CONSTRAINT "route_points_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_target_shelter_id_shelters_id_fk" FOREIGN KEY ("target_shelter_id") REFERENCES "public"."shelters"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelter_checkins" ADD CONSTRAINT "shelter_checkins_shelter_id_shelters_id_fk" FOREIGN KEY ("shelter_id") REFERENCES "public"."shelters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelter_needs" ADD CONSTRAINT "shelter_needs_shelter_id_shelters_id_fk" FOREIGN KEY ("shelter_id") REFERENCES "public"."shelters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelter_populations" ADD CONSTRAINT "shelter_populations_shelter_id_shelters_id_fk" FOREIGN KEY ("shelter_id") REFERENCES "public"."shelters"("id") ON DELETE cascade ON UPDATE no action;