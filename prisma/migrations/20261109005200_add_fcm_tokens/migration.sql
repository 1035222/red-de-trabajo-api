CREATE TABLE `fcm_tokens` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `token` VARCHAR(512) NOT NULL,
    `platform` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fcm_tokens_token_key` (`token`),
    INDEX `fcm_tokens_user_id_idx` (`user_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fcm_tokens_user_id_fkey`
        FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
