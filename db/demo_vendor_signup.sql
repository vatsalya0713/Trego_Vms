-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: demo
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `vendor_signup`
--

DROP TABLE IF EXISTS `vendor_signup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_signup` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobileNo` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'vendor',
  `verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `otp` varchar(10) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_signup`
--

LOCK TABLES `vendor_signup` WRITE;
/*!40000 ALTER TABLE `vendor_signup` DISABLE KEYS */;
INSERT INTO `vendor_signup` VALUES (1,'Aaditya@12','adityakuamr@gmail.com','8130424124','$2b$10$Cr2gfRCmULa6YvrnmjGzd.6r3ExW6tLsbtY2tpZXWzl7ONgWyFUQK','vendor',0,'2026-01-11 10:27:41','101564','2026-01-11 16:02:41'),(2,'Bharat','bharatKumar123@gmail.com','8130424124','$2b$10$jJKcDNa03LHTI/mMnNushOby.khLXi1zTVxkq2SfJ8Em1GSLZFAnq','vendor',0,'2026-01-11 13:32:52','377930','2026-01-11 19:07:53'),(3,'sahil','sahilkuamr@gmail.com','8130424124','$2b$10$aGS3ID6eCFKjJt3PyvGNuuozIuz8D3OyAvXiLglScjUnCtgOWlKim','vendor',0,'2026-01-11 13:58:58','713571','2026-01-11 19:33:58'),(4,'Tushar','tushar@gmail.com','8130424124','$2b$10$aWIGE6BrMJgl.6F5cQKmCumWWIy95cjMB6dvEwBbBzlAyIABKj4ze','vendor',0,'2026-01-11 17:08:43','965094','2026-01-11 22:45:08'),(6,'tushars','tushasr@gmail.com','8130424124','$2b$10$q4UHuP.Fpwuv6pdWKa1b.Ow4MjEiLW0LiDNS5.jy82oiS1VxXPo.m','vendor',0,'2026-01-11 18:47:34','356046','2026-01-12 00:22:35'),(7,'luv','luvkuamr@gmail.com','8130424124','$2b$10$aq3cigEQtdrdH2ihX2jCV.ZlOtpUlBwM6oP1TdfgSzQuYtmmlaO6O','vendor',0,'2026-01-12 15:37:02','664227','2026-01-12 21:12:02'),(8,'Misra Store','aadityakuamr518@gmail.com','8130424124','$2b$10$5bqFZQESMQYKq3qrOI9FAefNMRgqpzjRxUACoOgdenk5qJx/DjHhO','vendor',0,'2026-01-16 17:02:09','610341','2026-01-16 22:37:09'),(9,'Amit','amitkuamr@gmail.com','8130424124','$2b$10$JB7Dxnuu9RygxTc1L7AQeOc7dpLuP562GUk1sTHuDJ4vHv4fj9Zpq','vendor',0,'2026-01-27 17:08:35','880461','2026-01-27 22:43:36'),(10,'Sonal','sonalmishra@gmail.com','8130424124','$2b$10$DIcSgq3sNTy6D7U859oGK.NE6fGk49Rj1k8hxof8BHDFUggNJ.7cm','vendor',0,'2026-01-29 17:38:08','308364','2026-01-29 23:13:09');
/*!40000 ALTER TABLE `vendor_signup` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 11:49:35
