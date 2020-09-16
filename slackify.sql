-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 16, 2020 at 03:28 PM
-- Server version: 10.4.13-MariaDB
-- PHP Version: 7.4.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `slackify`
--

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `id` int(11) NOT NULL,
  `shop_origin` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `access_token` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `notifications` text COLLATE utf8_unicode_ci NOT NULL,
  `slack_access` text COLLATE utf8_unicode_ci NOT NULL,
  `slack_webhook_url` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `subscription_id` bigint(20) NOT NULL,
  `subscription_plan` tinyint(10) NOT NULL DEFAULT 0,
  `subscription_status` tinyint(4) NOT NULL DEFAULT 0,
  `slack_connected` tinyint(4) NOT NULL DEFAULT 0,
  `first_installed_time` datetime NOT NULL DEFAULT current_timestamp(),
  `trial_expiration_time` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `subscription_activated_time` datetime DEFAULT NULL,
  `timezone` varchar(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT '+00',
  `money_format` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '${{amount}}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `shops`
--

INSERT INTO `shops` (`id`, `shop_origin`, `access_token`, `notifications`, `slack_access`, `slack_webhook_url`, `subscription_id`, `subscription_plan`, `subscription_status`, `slack_connected`, `first_installed_time`, `trial_expiration_time`, `subscription_activated_time`, `timezone`, `money_format`) VALUES
(1, 'appliquette-dev.myshopify.com', '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', '{\"new_order\":true,\"cancelled_order\":true,\"paid_order\":true,\"fulfilled_order\":true,\"partially_fulfilled_order\":true,\"sales_report\":true}', '{\"ok\":true,\"app_id\":\"A019D9RFVFF\",\"authed_user\":{\"id\":\"U0190BVQ8BH\"},\"scope\":\"incoming-webhook\",\"token_type\":\"bot\",\"access_token\":\"xoxb-1327331675796-1327904664290-jr1vE11SIqk5KushVqi0Ygem\",\"bot_user_id\":\"U019MSLKJ8J\",\"team\":{\"id\":\"T019M9RKVPE\",\"name\":\"slackify\"},\"enterprise\":null,\"incoming_webhook\":{\"channel\":\"shopify-app\",\"channel_id\":\"C019TNP8K09\",\"configuration_url\":\"https:\\/\\/slackifytalk.slack.com\\/services\\/B01AYQDLNUU\",\"url\":\"https:\\/\\/hooks.slack.com\\/services\\/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\"}}', 'https://hooks.slack.com/services/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', 18610618529, 2, 1, 1, '2020-09-13 18:23:35', '1600615415', '2020-09-16 10:50:01', '+10', '${{amount}}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `shop_origin` (`shop_origin`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
