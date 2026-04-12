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
-- Table structure for table `bucket_medicine_map`
--

DROP TABLE IF EXISTS `bucket_medicine_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bucket_medicine_map` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bucket_id` int NOT NULL,
  `medicine_id` int NOT NULL,
  `medicine_source` enum('master','vendor') NOT NULL,
  `medicine_owner` enum('super_admin','vendor') NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `vendor_user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `packaging` varchar(100) DEFAULT NULL,
  `is_bucket` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bucket_medicine_vendor` (`bucket_id`,`medicine_id`,`medicine_source`,`vendor_user_id`),
  KEY `fk_bmm_vendor` (`vendor_user_id`),
  CONSTRAINT `fk_bmm_bucket` FOREIGN KEY (`bucket_id`) REFERENCES `bucket` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bmm_vendor` FOREIGN KEY (`vendor_user_id`) REFERENCES `vendor_signup` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bucket_medicine_map`
--

LOCK TABLES `bucket_medicine_map` WRITE;
/*!40000 ALTER TABLE `bucket_medicine_map` DISABLE KEYS */;
INSERT INTO `bucket_medicine_map` VALUES (1,4,43,'vendor','super_admin','',1,'2026-02-01 10:58:58',NULL,1),(2,4,44,'vendor','super_admin','',9,'2026-02-01 10:59:02',NULL,1),(3,4,45,'vendor','super_admin','',9,'2026-02-01 10:59:06',NULL,1),(4,4,46,'vendor','super_admin','',1,'2026-02-01 10:59:22',NULL,1),(5,4,47,'vendor','super_admin','',1,'2026-02-01 10:59:25',NULL,1),(6,4,48,'vendor','super_admin','',1,'2026-02-02 12:36:39',NULL,1),(7,4,1,'master','super_admin','',1,'2026-02-02 12:48:41',NULL,1),(8,4,24,'master','super_admin','',1,'2026-02-02 12:48:46',NULL,1),(9,4,34,'master','super_admin','',1,'2026-02-02 12:48:51',NULL,1),(10,2,2,'master','super_admin','',1,'2026-02-02 18:01:48',NULL,1),(11,2,22,'master','super_admin','',1,'2026-02-02 18:01:50',NULL,1),(12,2,25,'master','super_admin','',1,'2026-02-02 18:02:04',NULL,1),(13,2,31,'master','super_admin','',1,'2026-02-02 18:02:29',NULL,1),(14,4,30,'master','super_admin','',1,'2026-02-08 11:04:48',NULL,1),(15,1,1,'master','super_admin','',1,'2026-02-23 16:09:32',NULL,1),(16,5,35,'master','super_admin','',1,'2026-02-24 18:15:38',NULL,1),(17,5,34,'master','super_admin','',1,'2026-02-24 18:15:43',NULL,1),(18,5,99,'master','super_admin','',1,'2026-02-24 18:15:47',NULL,1),(19,5,1,'master','super_admin','',1,'2026-02-24 18:18:29',NULL,1),(20,5,21,'master','super_admin','',1,'2026-02-24 18:18:33',NULL,1),(21,2,26,'master','super_admin','',1,'2026-02-24 19:58:58',NULL,1),(22,2,37,'master','super_admin','',1,'2026-02-24 19:59:15',NULL,1),(23,5,26,'master','super_admin','',1,'2026-02-24 20:04:44',NULL,1),(24,5,40,'master','super_admin','',1,'2026-02-24 20:04:52',NULL,1),(25,2,21,'master','super_admin','',1,'2026-02-25 04:48:10',NULL,1),(26,2,38,'master','super_admin','',1,'2026-02-25 05:07:22',NULL,1),(31,2,15,'master','super_admin','',1,'2026-03-07 23:51:43',NULL,1),(32,2,16,'master','super_admin','',1,'2026-03-07 23:51:43',NULL,1),(33,2,19,'master','super_admin','',1,'2026-03-21 13:09:54',NULL,1),(34,2,17,'master','super_admin','',1,'2026-03-21 13:10:02',NULL,1),(35,2,1,'master','super_admin','',1,'2026-03-21 13:10:08',NULL,1),(36,4,15,'master','super_admin','',1,'2026-03-21 13:14:15',NULL,1),(37,4,17,'master','super_admin','',1,'2026-03-21 13:14:15',NULL,1),(38,4,16,'master','super_admin','',1,'2026-03-21 13:14:15',NULL,1),(39,4,19,'master','super_admin','',1,'2026-03-21 13:14:15',NULL,1),(40,3,17,'master','super_admin','',1,'2026-03-21 13:14:38',NULL,1),(41,3,1,'master','super_admin','',1,'2026-03-21 13:14:38',NULL,1),(42,3,15,'master','super_admin','',1,'2026-03-21 13:14:38',NULL,1),(44,3,16,'master','super_admin','',1,'2026-03-21 13:14:38',NULL,1),(46,5,17,'master','super_admin','',1,'2026-03-21 13:15:08',NULL,1),(48,5,19,'master','super_admin','',1,'2026-03-21 13:15:08',NULL,1),(50,5,22,'master','super_admin','',1,'2026-03-22 05:49:49',NULL,1),(51,5,15,'master','super_admin','',1,'2026-03-22 05:49:58',NULL,1),(53,2,319,'master','super_admin','',1,'2026-03-22 10:38:10',NULL,1),(54,2,322,'master','super_admin','',1,'2026-03-22 10:38:34',NULL,1),(55,2,333,'master','super_admin','',1,'2026-03-22 11:10:28',NULL,1),(56,2,359,'master','super_admin','',1,'2026-03-22 11:15:09',NULL,1),(57,2,323,'master','super_admin','',1,'2026-03-22 11:16:18',NULL,1),(58,2,343,'master','super_admin','',1,'2026-03-22 11:17:56',NULL,1),(59,2,337,'master','super_admin','',1,'2026-03-22 11:18:44',NULL,1),(60,6,319,'master','super_admin','',1,'2026-03-22 11:19:01',NULL,1),(61,6,321,'master','super_admin','',1,'2026-03-22 11:19:01',NULL,1),(62,6,334,'master','super_admin','',1,'2026-03-22 12:37:39',NULL,1),(63,6,333,'master','super_admin','',1,'2026-03-22 12:37:39',NULL,1),(64,6,336,'master','super_admin','',1,'2026-03-22 12:37:39',NULL,1),(65,6,338,'master','super_admin','',1,'2026-03-22 12:37:39',NULL,1),(66,6,337,'master','super_admin','',1,'2026-03-22 12:37:39',NULL,1),(67,5,320,'master','super_admin','',1,'2026-03-22 13:32:22',NULL,1),(68,4,341,'master','super_admin','',1,'2026-03-22 13:32:33',NULL,1),(69,4,342,'master','super_admin','',1,'2026-03-22 13:32:33',NULL,1),(70,2,334,'master','super_admin','',1,'2026-03-23 15:10:16',NULL,1),(71,7,40,'master','super_admin','',1,'2026-03-23 18:17:48',NULL,1),(72,7,41,'master','super_admin','',1,'2026-03-23 18:18:08',NULL,1),(73,7,43,'master','super_admin','',1,'2026-03-23 18:18:08',NULL,1),(74,7,42,'master','super_admin','',1,'2026-03-23 18:18:08',NULL,1),(75,7,44,'master','super_admin','',1,'2026-03-23 18:18:08',NULL,1),(76,7,45,'master','super_admin','',1,'2026-03-23 18:18:08',NULL,1),(77,7,46,'master','super_admin','',1,'2026-03-23 18:23:57',NULL,1),(78,1,44,'master','super_admin','',1,'2026-03-23 18:24:09',NULL,1),(79,1,48,'master','super_admin','',1,'2026-03-23 18:24:09',NULL,1),(80,1,47,'master','super_admin','',1,'2026-03-23 18:24:09',NULL,1),(81,7,49,'master','super_admin','',1,'2026-03-23 18:36:33',NULL,1),(82,7,50,'master','super_admin','',1,'2026-03-23 18:44:07',NULL,1),(83,6,51,'master','super_admin','',1,'2026-03-23 18:45:38',NULL,1),(85,7,52,'master','super_admin','',1,'2026-03-23 18:57:52',NULL,1),(86,1,321,'master','super_admin','',1,'2026-03-25 17:30:57',NULL,1);
/*!40000 ALTER TABLE `bucket_medicine_map` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-12 11:49:36
