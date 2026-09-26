import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_sizes_size" AS ENUM('S', 'M', 'L', 'XL', 'XXL');
  CREATE TYPE "public"."enum_products_size_chart_size" AS ENUM('S', 'M', 'L', 'XL', 'XXL');
  CREATE TYPE "public"."enum_products_category" AS ENUM('Shirts', 'Quarter-zips', 'Linen pants', 'Caps', 'Official and events');
  CREATE TYPE "public"."enum_shows_name" AS ENUM('The Court', 'Fit School', 'Maskani', 'The Gameweek');
  CREATE TYPE "public"."enum_shows_mode" AS ENUM('day', 'night');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_counties_delivery_band" AS ENUM('metro', 'near', 'far');
  CREATE TYPE "public"."enum_delivery_rates_band" AS ENUM('metro', 'near', 'far');
  CREATE TYPE "public"."enum_stock_size" AS ENUM('S', 'M', 'L', 'XL', 'XXL');
  CREATE TYPE "public"."enum_stock_movements_size" AS ENUM('S', 'M', 'L', 'XL', 'XXL');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "products_sizes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_products_sizes_size" NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL
  );
  
  CREATE TABLE "products_size_chart" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_products_size_chart_size",
  	"chest" varchar,
  	"body" varchar,
  	"sleeve" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" "enum_products_category" NOT NULL,
  	"price" numeric NOT NULL,
  	"description" varchar,
  	"fabric_care" varchar,
  	"fit_notes" varchar,
  	"run_size" numeric,
  	"archived" boolean DEFAULT false,
  	"related_episode_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "issues" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"cover_id" integer,
  	"cover_line" varchar NOT NULL,
  	"cover_credit" varchar,
  	"publish_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "shows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" "enum_shows_name" NOT NULL,
  	"description" varchar,
  	"cadence" varchar,
  	"playlist_id" varchar,
  	"mode" "enum_shows_mode" DEFAULT 'day',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "episodes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"youtube_id" varchar NOT NULL,
  	"show_id" integer NOT NULL,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"still_id" integer,
  	"transcript" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "episodes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"body" jsonb,
  	"episode_id" integer,
  	"cover_id" integer,
  	"status" "enum_articles_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "counties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"code" varchar NOT NULL,
  	"delivery_band" "enum_counties_delivery_band",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "delivery_rates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"band" "enum_delivery_rates_band" NOT NULL,
  	"fee_k_e_s" numeric NOT NULL,
  	"min_days" numeric NOT NULL,
  	"max_days" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"public_code" varchar NOT NULL,
  	"fpl_team_id" numeric NOT NULL,
  	"county_id" integer NOT NULL,
  	"whatsapp" varchar,
  	"weekly_table_opt_in" boolean DEFAULT false,
  	"uniform_opt_in" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"last_points" numeric DEFAULT 0,
  	"last_rank" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stock" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"product_id" integer NOT NULL,
  	"size" "enum_stock_size" NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stock_movements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"size" "enum_stock_movements_size" NOT NULL,
  	"delta" numeric NOT NULL,
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "order_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"page" varchar NOT NULL,
  	"piece" varchar,
  	"county" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "league_snapshots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"gameweek" numeric NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"manager_table" jsonb,
  	"county_table" jsonb,
  	"month_table" jsonb,
  	"locked_squads" jsonb,
  	"locked_scores" jsonb,
  	"copy_text" varchar,
  	"table_image_id" integer,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "fpl_cache" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"response" jsonb NOT NULL,
  	"fetched_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"products_id" integer,
  	"media_id" integer,
  	"issues_id" integer,
  	"shows_id" integer,
  	"episodes_id" integer,
  	"articles_id" integer,
  	"counties_id" integer,
  	"delivery_rates_id" integer,
  	"members_id" integer,
  	"stock_id" integer,
  	"stock_movements_id" integer,
  	"order_events_id" integer,
  	"league_snapshots_id" integer,
  	"fpl_cache_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"shop_phone" varchar DEFAULT '+254 729 286626' NOT NULL,
  	"whatsapp_greeting" varchar DEFAULT 'Hi SHATI, I have a question.',
  	"opening_hours" varchar,
  	"store_address" varchar,
  	"member_price_percent" numeric,
  	"ticker_text" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_sizes" ADD CONSTRAINT "products_sizes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_size_chart" ADD CONSTRAINT "products_size_chart_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_related_episode_id_episodes_id_fk" FOREIGN KEY ("related_episode_id") REFERENCES "public"."episodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "issues" ADD CONSTRAINT "issues_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "episodes" ADD CONSTRAINT "episodes_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "episodes" ADD CONSTRAINT "episodes_still_id_media_id_fk" FOREIGN KEY ("still_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "episodes_rels" ADD CONSTRAINT "episodes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "episodes_rels" ADD CONSTRAINT "episodes_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "members" ADD CONSTRAINT "members_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stock" ADD CONSTRAINT "stock_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "league_snapshots" ADD CONSTRAINT "league_snapshots_table_image_id_media_id_fk" FOREIGN KEY ("table_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_issues_fk" FOREIGN KEY ("issues_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shows_fk" FOREIGN KEY ("shows_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_episodes_fk" FOREIGN KEY ("episodes_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_counties_fk" FOREIGN KEY ("counties_id") REFERENCES "public"."counties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_delivery_rates_fk" FOREIGN KEY ("delivery_rates_id") REFERENCES "public"."delivery_rates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stock_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."stock"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stock_movements_fk" FOREIGN KEY ("stock_movements_id") REFERENCES "public"."stock_movements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_order_events_fk" FOREIGN KEY ("order_events_id") REFERENCES "public"."order_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_league_snapshots_fk" FOREIGN KEY ("league_snapshots_id") REFERENCES "public"."league_snapshots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_fpl_cache_fk" FOREIGN KEY ("fpl_cache_id") REFERENCES "public"."fpl_cache"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "products_sizes_order_idx" ON "products_sizes" USING btree ("_order");
  CREATE INDEX "products_sizes_parent_id_idx" ON "products_sizes" USING btree ("_parent_id");
  CREATE INDEX "products_size_chart_order_idx" ON "products_size_chart" USING btree ("_order");
  CREATE INDEX "products_size_chart_parent_id_idx" ON "products_size_chart" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_related_episode_idx" ON "products" USING btree ("related_episode_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "issues_number_idx" ON "issues" USING btree ("number");
  CREATE INDEX "issues_cover_idx" ON "issues" USING btree ("cover_id");
  CREATE INDEX "issues_publish_at_idx" ON "issues" USING btree ("publish_at");
  CREATE INDEX "issues_updated_at_idx" ON "issues" USING btree ("updated_at");
  CREATE INDEX "issues_created_at_idx" ON "issues" USING btree ("created_at");
  CREATE UNIQUE INDEX "shows_name_idx" ON "shows" USING btree ("name");
  CREATE INDEX "shows_updated_at_idx" ON "shows" USING btree ("updated_at");
  CREATE INDEX "shows_created_at_idx" ON "shows" USING btree ("created_at");
  CREATE UNIQUE INDEX "episodes_youtube_id_idx" ON "episodes" USING btree ("youtube_id");
  CREATE INDEX "episodes_show_idx" ON "episodes" USING btree ("show_id");
  CREATE INDEX "episodes_still_idx" ON "episodes" USING btree ("still_id");
  CREATE INDEX "episodes_updated_at_idx" ON "episodes" USING btree ("updated_at");
  CREATE INDEX "episodes_created_at_idx" ON "episodes" USING btree ("created_at");
  CREATE INDEX "episodes_rels_order_idx" ON "episodes_rels" USING btree ("order");
  CREATE INDEX "episodes_rels_parent_idx" ON "episodes_rels" USING btree ("parent_id");
  CREATE INDEX "episodes_rels_path_idx" ON "episodes_rels" USING btree ("path");
  CREATE INDEX "episodes_rels_products_id_idx" ON "episodes_rels" USING btree ("products_id");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_episode_idx" ON "articles" USING btree ("episode_id");
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE UNIQUE INDEX "counties_name_idx" ON "counties" USING btree ("name");
  CREATE UNIQUE INDEX "counties_code_idx" ON "counties" USING btree ("code");
  CREATE INDEX "counties_updated_at_idx" ON "counties" USING btree ("updated_at");
  CREATE INDEX "counties_created_at_idx" ON "counties" USING btree ("created_at");
  CREATE UNIQUE INDEX "delivery_rates_band_idx" ON "delivery_rates" USING btree ("band");
  CREATE INDEX "delivery_rates_updated_at_idx" ON "delivery_rates" USING btree ("updated_at");
  CREATE INDEX "delivery_rates_created_at_idx" ON "delivery_rates" USING btree ("created_at");
  CREATE UNIQUE INDEX "members_public_code_idx" ON "members" USING btree ("public_code");
  CREATE UNIQUE INDEX "members_fpl_team_id_idx" ON "members" USING btree ("fpl_team_id");
  CREATE INDEX "members_county_idx" ON "members" USING btree ("county_id");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE INDEX "stock_product_idx" ON "stock" USING btree ("product_id");
  CREATE INDEX "stock_created_at_idx" ON "stock" USING btree ("created_at");
  CREATE UNIQUE INDEX "product_size_idx" ON "stock" USING btree ("product_id","size");
  CREATE INDEX "stock_movements_product_idx" ON "stock_movements" USING btree ("product_id");
  CREATE INDEX "stock_movements_updated_at_idx" ON "stock_movements" USING btree ("updated_at");
  CREATE INDEX "stock_movements_created_at_idx" ON "stock_movements" USING btree ("created_at");
  CREATE INDEX "order_events_updated_at_idx" ON "order_events" USING btree ("updated_at");
  CREATE INDEX "order_events_created_at_idx" ON "order_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "league_snapshots_gameweek_idx" ON "league_snapshots" USING btree ("gameweek");
  CREATE INDEX "league_snapshots_table_image_idx" ON "league_snapshots" USING btree ("table_image_id");
  CREATE INDEX "league_snapshots_created_at_idx" ON "league_snapshots" USING btree ("created_at");
  CREATE UNIQUE INDEX "fpl_cache_url_idx" ON "fpl_cache" USING btree ("url");
  CREATE INDEX "fpl_cache_fetched_at_idx" ON "fpl_cache" USING btree ("fetched_at");
  CREATE INDEX "fpl_cache_updated_at_idx" ON "fpl_cache" USING btree ("updated_at");
  CREATE INDEX "fpl_cache_created_at_idx" ON "fpl_cache" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_issues_id_idx" ON "payload_locked_documents_rels" USING btree ("issues_id");
  CREATE INDEX "payload_locked_documents_rels_shows_id_idx" ON "payload_locked_documents_rels" USING btree ("shows_id");
  CREATE INDEX "payload_locked_documents_rels_episodes_id_idx" ON "payload_locked_documents_rels" USING btree ("episodes_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_counties_id_idx" ON "payload_locked_documents_rels" USING btree ("counties_id");
  CREATE INDEX "payload_locked_documents_rels_delivery_rates_id_idx" ON "payload_locked_documents_rels" USING btree ("delivery_rates_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_stock_id_idx" ON "payload_locked_documents_rels" USING btree ("stock_id");
  CREATE INDEX "payload_locked_documents_rels_stock_movements_id_idx" ON "payload_locked_documents_rels" USING btree ("stock_movements_id");
  CREATE INDEX "payload_locked_documents_rels_order_events_id_idx" ON "payload_locked_documents_rels" USING btree ("order_events_id");
  CREATE INDEX "payload_locked_documents_rels_league_snapshots_id_idx" ON "payload_locked_documents_rels" USING btree ("league_snapshots_id");
  CREATE INDEX "payload_locked_documents_rels_fpl_cache_id_idx" ON "payload_locked_documents_rels" USING btree ("fpl_cache_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "products_sizes" CASCADE;
  DROP TABLE "products_size_chart" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "issues" CASCADE;
  DROP TABLE "shows" CASCADE;
  DROP TABLE "episodes" CASCADE;
  DROP TABLE "episodes_rels" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "counties" CASCADE;
  DROP TABLE "delivery_rates" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "stock" CASCADE;
  DROP TABLE "stock_movements" CASCADE;
  DROP TABLE "order_events" CASCADE;
  DROP TABLE "league_snapshots" CASCADE;
  DROP TABLE "fpl_cache" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_products_sizes_size";
  DROP TYPE "public"."enum_products_size_chart_size";
  DROP TYPE "public"."enum_products_category";
  DROP TYPE "public"."enum_shows_name";
  DROP TYPE "public"."enum_shows_mode";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum_counties_delivery_band";
  DROP TYPE "public"."enum_delivery_rates_band";
  DROP TYPE "public"."enum_stock_size";
  DROP TYPE "public"."enum_stock_movements_size";`)
}
