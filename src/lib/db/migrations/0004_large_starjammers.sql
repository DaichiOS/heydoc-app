ALTER TABLE "doctors" ADD COLUMN "training_level" varchar(100);--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "work_situation" text[];--> statement-breakpoint
CREATE INDEX "idx_doctors_training_level" ON "doctors" USING btree ("training_level");