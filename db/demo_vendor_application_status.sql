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
-- Table structure for table `vendor_application_status`
--

DROP TABLE IF EXISTS `vendor_application_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendor_application_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `applicant_id` int NOT NULL,
  `status` enum('DRAFT','PENDING_APPROVAL','SUPER_ADMIN_REVIEW','APPROVED','REJECTED') DEFAULT 'DRAFT',
  `editable` tinyint(1) DEFAULT '1',
  `admin_feedback` text,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applicant_id` (`applicant_id`),
  CONSTRAINT `fk_status_applicant` FOREIGN KEY (`applicant_id`) REFERENCES `vendor_informations` (`applicant_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendor_application_status`
--

LOCK TABLES `vendor_application_status` WRITE;
/*!40000 ALTER TABLE `vendor_application_status` DISABLE KEYS */;
INSERT INTO `vendor_application_status` VALUES (1,1,'APPROVED',0,'check status of applicant id ','2026-01-11 10:29:29',NULL),(2,2,'APPROVED',0,'check the medicine badge','2026-01-11 13:57:19',NULL),(3,3,'DRAFT',1,NULL,NULL,NULL),(4,4,'DRAFT',1,NULL,NULL,NULL),(5,5,'DRAFT',1,NULL,NULL,NULL),(6,6,'REJECTED',0,NULL,'2026-01-12 15:39:47',NULL),(7,7,'APPROVED',0,'Cross check   drug license validity','2026-01-16 17:14:04',NULL),(8,8,'DRAFT',1,NULL,NULL,NULL),(9,9,'APPROVED',0,'Attachment Mismatch','2026-01-29 16:36:05',NULL);
/*!40000 ALTER TABLE `vendor_application_status` ENABLE KEYS */;
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
