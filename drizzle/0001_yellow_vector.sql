CREATE TABLE `discussions` (
	`id` varchar(64) NOT NULL,
	`hypothesisId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `discussions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` varchar(64) NOT NULL,
	`hypothesisId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`validityScore` int,
	`feasibilityScore` int,
	`noveltyScore` int,
	`policyImportanceScore` int,
	`overallScore` int,
	`comment` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hypotheses` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`confidence` int NOT NULL,
	`researchMethods` json NOT NULL,
	`keyFactors` json NOT NULL,
	`dataSourcesUsed` json NOT NULL,
	`policyImplications` json NOT NULL,
	`noveltyScore` int NOT NULL,
	`feasibilityScore` int NOT NULL,
	`expectedImpact` text NOT NULL,
	`aiComment` text,
	`userId` varchar(64) NOT NULL,
	`generatedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `hypotheses_id` PRIMARY KEY(`id`)
);
